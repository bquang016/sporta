package com.backend.sporta.service;

import com.backend.sporta.config.RecommendationProperties;
import com.backend.sporta.dto.RecommendedVenueResponse;
import com.backend.sporta.entity.*;
import com.backend.sporta.enums.ApprovalStatus;
import com.backend.sporta.enums.VenueStatus;
import com.backend.sporta.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VenueRecommendationServiceImpl implements VenueRecommendationService {

    private final VenueRepository venueRepository;
    private final CourtRepository courtRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final RecommendationLogRepository recommendationLogRepository;
    private final RecommendationDailyMetricRepository dailyMetricRepository;
    private final RecommendationProperties properties;

    @Override
    @Transactional
    public List<RecommendedVenueResponse> getPersonalizedRecommendations(
            String userEmail,
            Double latitude,
            Double longitude,
            Long filterSportId,
            Integer limit
    ) {
        int targetLimit = (limit != null && limit > 0) ? limit : 6;

        // 1. Retrieve user profile and booking history (if logged in)
        User currentUser = null;
        List<Booking> userBookings = new ArrayList<>();
        if (userEmail != null && !userEmail.trim().isEmpty() && !userEmail.equalsIgnoreCase("anonymousUser")) {
            Optional<User> userOpt = userRepository.findByEmail(userEmail);
            if (userOpt.isPresent()) {
                currentUser = userOpt.get();
                userBookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
            }
        }

        // Analyze user preferences
        UserPreferenceProfile profile = analyzeUserPreferences(userBookings);

        // 2. Candidate Filtering with Progressive Radius Expansion (incorporating filterSportId at all stages)
        List<Venue> candidates = fetchCandidateVenues(latitude, longitude, filterSportId, targetLimit);
        if (candidates.isEmpty()) {
            return Collections.emptyList();
        }

        // 3. Batch compute prices & confirmed booking counts ONLY for candidates (Avoid N+1 and findAll)
        List<UUID> candidateIds = candidates.stream().map(Venue::getId).collect(Collectors.toList());
        Map<UUID, Long> bookingCountMap = new HashMap<>();
        List<Object[]> bookingCounts = venueRepository.countConfirmedBookingsByVenueIds(candidateIds);
        if (bookingCounts != null) {
            for (Object[] row : bookingCounts) {
                if (row.length >= 2 && row[0] != null && row[1] != null) {
                    bookingCountMap.put((UUID) row[0], ((Number) row[1]).longValue());
                }
            }
        }

        double candidateMinPrice = Double.MAX_VALUE;
        double candidateMaxPrice = 0.0;
        Map<UUID, Double> venueAvgPriceMap = new HashMap<>();
        Map<UUID, Double> venueMinPriceMap = new HashMap<>();
        Map<UUID, Double> venueMaxPriceMap = new HashMap<>();

        for (Venue v : candidates) {
            Double minP = courtRepository.findMinPriceByVenueIdAndStatusActive(v.getId());
            Double maxP = courtRepository.findMaxPriceByVenueIdAndStatusActive(v.getId());
            double avgP = (minP != null && maxP != null) ? (minP + maxP) / 2.0 : (minP != null ? minP : 200000.0);
            venueAvgPriceMap.put(v.getId(), avgP);
            venueMinPriceMap.put(v.getId(), minP != null ? minP : 0.0);
            venueMaxPriceMap.put(v.getId(), maxP != null ? maxP : 0.0);

            if (minP != null && minP < candidateMinPrice) candidateMinPrice = minP;
            if (maxP != null && maxP > candidateMaxPrice) candidateMaxPrice = maxP;
        }

        double priceRange = (candidateMaxPrice > candidateMinPrice)
                ? Math.max(candidateMaxPrice - candidateMinPrice, properties.getParameters().getDefaultPriceRange())
                : properties.getParameters().getDefaultPriceRange();

        // 4. Weight determination and re-normalization (if GPS is missing)
        double wSport = properties.getWeights().getSport();
        double wDist = properties.getWeights().getDistance();
        double wPrice = properties.getWeights().getPrice();
        double wPop = properties.getWeights().getPopularity();
        double wHist = properties.getWeights().getHistory();

        boolean hasGps = (latitude != null && longitude != null);
        if (!hasGps) {
            wDist = 0.0;
            double sumRemaining = wSport + wPrice + wPop + wHist;
            if (sumRemaining > 0) {
                wSport /= sumRemaining;
                wPrice /= sumRemaining;
                wPop /= sumRemaining;
                wHist /= sumRemaining;
            }
        }

        // Progressive blending factor alpha based on booking count
        int totalBookings = userBookings.size();
        double alpha = Math.min(1.0, totalBookings / (double) properties.getParameters().getColdStartThreshold());

        // 5. Score candidates
        List<ScoredVenue> scoredVenues = new ArrayList<>();

        for (Venue v : candidates) {
            Double distKm = null;
            double sDist = 0.0;
            if (hasGps && v.getLatitude() != null && v.getLongitude() != null) {
                distKm = calculateHaversineDistance(latitude, longitude, v.getLatitude(), v.getLongitude());
                sDist = calculateGaussianDistanceScore(distKm, properties.getParameters().getSigmaKm());
            }

            Long venueSportId = (v.getSport() != null) ? v.getSport().getId() : null;
            double sMatch = calculateSportMatchScore(venueSportId, profile.primarySportId, profile.secondarySportIds);
            double sPrice = calculatePriceAffinityScore(venueAvgPriceMap.get(v.getId()), profile.avgPrice, priceRange);

            // Popularity score based on bookings & standard rating benchmark
            double sPop = calculatePopularityScore(4.8, bookingCountMap.getOrDefault(v.getId(), 0L));

            int pastBookingsAtThisVenue = profile.venueBookingCounts.getOrDefault(v.getId(), 0);
            double sHist = calculateHistoryScore(pastBookingsAtThisVenue);

            // Personalized score
            double scorePers = 100.0 * (wSport * sMatch + wDist * sDist + wPrice * sPrice + wPop * sPop + wHist * sHist);

            // Cold start score (re-normalized if GPS is absent)
            double scoreCold;
            if (hasGps) {
                scoreCold = 100.0 * (0.45 * sDist + 0.35 * sPop + 0.20 * sMatch);
            } else {
                scoreCold = 100.0 * (0.60 * sPop + 0.40 * sMatch);
            }

            // Final blended score
            double finalScore = alpha * scorePers + (1.0 - alpha) * scoreCold;
            finalScore = Math.max(10.0, Math.min(99.0, Math.round(finalScore)));

            // Reason tag disambiguation (Deterministic priority)
            String reasonType;
            String reasonTag;
            if (pastBookingsAtThisVenue >= 2) {
                reasonType = "HISTORY";
                reasonTag = "Sân quen • Đã đặt " + pastBookingsAtThisVenue + " lần";
            } else {
                double cSport = wSport * sMatch;
                double cDist = wDist * sDist;
                double cPrice = wPrice * sPrice;
                double cPop = wPop * sPop;
                double cHist = wHist * sHist;

                if (cHist > cSport && cHist > cDist && cHist > cPrice && cHist > cPop && pastBookingsAtThisVenue == 1) {
                    reasonType = "HISTORY";
                    reasonTag = "Sân bạn đã từng trải nghiệm";
                } else if (cSport >= cDist && cSport >= cPrice && cSport >= cPop && sMatch >= 0.9) {
                    reasonType = "SPORT";
                    reasonTag = (v.getSport() != null)
                            ? "Phù hợp môn " + v.getSport().getName() + " yêu thích"
                            : "Môn bạn chơi nhiều nhất";
                } else if (cDist >= cSport && cDist >= cPrice && cDist >= cPop && distKm != null && distKm <= 2.5) {
                    reasonType = "DISTANCE";
                    reasonTag = String.format("Cách vị trí của bạn %.1f km", distKm);
                } else if (cPrice >= cSport && cPrice >= cDist && cPrice >= cPop && sPrice >= 0.85) {
                    reasonType = "PRICE";
                    reasonTag = "Mức giá phù hợp thói quen";
                } else {
                    reasonType = "POPULARITY";
                    reasonTag = "Sân thể thao nhiều người yêu thích";
                }
            }

            scoredVenues.add(new ScoredVenue(v, (int) finalScore, distKm, reasonType, reasonTag, pastBookingsAtThisVenue));
        }

        // Sort by finalScore descending
        scoredVenues.sort((a, b) -> Integer.compare(b.matchScore, a.matchScore));
        List<ScoredVenue> topResults = scoredVenues.stream().limit(targetLimit).collect(Collectors.toList());

        // 6. Map to DTO and save RecommendationLog (Impression)
        List<RecommendedVenueResponse> responseList = new ArrayList<>();
        for (int i = 0; i < topResults.size(); i++) {
            ScoredVenue sv = topResults.get(i);
            Venue v = sv.venue;

            List<String> detailImgs = v.getImages() != null
                    ? v.getImages().stream().map(VenueImage::getImageUrl).collect(Collectors.toList())
                    : new ArrayList<>();

            RecommendedVenueResponse dto = RecommendedVenueResponse.builder()
                    .id(v.getId())
                    .name(v.getName())
                    .location(v.getLocation())
                    .latitude(v.getLatitude())
                    .longitude(v.getLongitude())
                    .description(v.getDescription())
                    .province(v.getProvince())
                    .district(v.getDistrict())
                    .ward(v.getWard())
                    .addressDetail(v.getAddressDetail())
                    .openingTime(v.getOpeningTime())
                    .closingTime(v.getClosingTime())
                    .shiftDurationMinutes(v.getShiftDurationMinutes())
                    .coverImage(v.getCoverImage())
                    .detailImages(detailImgs)
                    .hasSurcharge(v.getHasSurcharge())
                    .surchargeAmount(v.getSurchargeAmount())
                    .surchargeDescription(v.getSurchargeDescription())
                    .status(v.getStatus())
                    .approvalStatus(v.getApprovalStatus())
                    .minPrice(venueMinPriceMap.get(v.getId()))
                    .maxPrice(venueMaxPriceMap.get(v.getId()))
                    .sportName(v.getSport() != null ? v.getSport().getName() : "")
                    .sportId(v.getSport() != null ? v.getSport().getId() : null)
                    .distanceKm(sv.distanceKm != null ? Math.round(sv.distanceKm * 10.0) / 10.0 : null)
                    .availableSlotsCount(v.getSubCourtCount() != null ? v.getSubCourtCount() * 4 : 8)
                    .matchScore(sv.matchScore)
                    .recommendationReason(sv.reasonTag)
                    .reasonType(sv.reasonType)
                    .pastBookingCount(sv.pastBookingCount)
                    .averageRating(v.getAverageRating() != null && v.getAverageRating() > 0 ? v.getAverageRating() : null)
                    .totalReviews(v.getTotalReviews() != null ? v.getTotalReviews() : 0)
                    .build();

            responseList.add(dto);

            // Log impression
            try {
                RecommendationLog logEntry = RecommendationLog.builder()
                        .userId(currentUser != null ? currentUser.getId() : null)
                        .userEmail(currentUser != null ? currentUser.getEmail() : (userEmail != null ? userEmail : "guest"))
                        .venueId(v.getId())
                        .matchScore(sv.matchScore)
                        .reasonType(sv.reasonType)
                        .reasonTag(sv.reasonTag)
                        .positionIndex(i)
                        .clicked(false)
                        .booked(false)
                        .createdAt(LocalDateTime.now())
                        .build();
                recommendationLogRepository.save(logEntry);
            } catch (Exception e) {
                log.warn("Lỗi lưu recommendation impression log: {}", e.getMessage());
            }
        }

        return responseList;
    }

    @Override
    @Transactional
    public void recordClick(UUID venueId, String userEmail) {
        if (venueId == null) return;
        List<RecommendationLog> logs;
        if (userEmail != null && !userEmail.trim().isEmpty() && !userEmail.equalsIgnoreCase("anonymousUser")) {
            logs = recommendationLogRepository.findLatestByUserAndVenue(userEmail, venueId);
        } else {
            logs = recommendationLogRepository.findLatestByVenue(venueId);
        }

        if (!logs.isEmpty()) {
            RecommendationLog latest = logs.get(0);
            latest.setClicked(true);
            recommendationLogRepository.save(latest);
        }
    }

    @Override
    @Transactional
    public void recordBooking(UUID venueId, String userEmail) {
        if (venueId == null) return;
        List<RecommendationLog> logs;
        if (userEmail != null && !userEmail.trim().isEmpty() && !userEmail.equalsIgnoreCase("anonymousUser")) {
            logs = recommendationLogRepository.findLatestByUserAndVenue(userEmail, venueId);
        } else {
            logs = recommendationLogRepository.findLatestByVenue(venueId);
        }

        if (!logs.isEmpty()) {
            RecommendationLog latest = logs.get(0);
            latest.setBooked(true);
            latest.setClicked(true);
            recommendationLogRepository.save(latest);
        }
    }

    @Override
    @Transactional
    public RecommendationDailyMetric calculateDailyMetrics(LocalDate reportDate) {
        LocalDate date = (reportDate != null) ? reportDate : LocalDate.now().minusDays(1);
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(23, 59, 59);

        List<RecommendationLog> logs = recommendationLogRepository.findByCreatedAtBetween(start, end);
        long impressions = logs.size();
        long clicks = logs.stream().filter(RecommendationLog::getClicked).count();
        long bookings = logs.stream().filter(RecommendationLog::getBooked).count();

        double ctr = (impressions > 0) ? ((double) clicks / impressions) * 100.0 : 0.0;

        long top3Impressions = logs.stream().filter(l -> l.getPositionIndex() != null && l.getPositionIndex() < 3).count();
        long top3Interactions = logs.stream().filter(l -> l.getPositionIndex() != null && l.getPositionIndex() < 3 && (l.getClicked() || l.getBooked())).count();
        double pAt3 = (top3Impressions > 0) ? ((double) top3Interactions / top3Impressions) * 100.0 : 0.0;

        long top6Impressions = logs.stream().filter(l -> l.getPositionIndex() != null && l.getPositionIndex() < 6).count();
        long top6Interactions = logs.stream().filter(l -> l.getPositionIndex() != null && l.getPositionIndex() < 6 && (l.getClicked() || l.getBooked())).count();
        double pAt6 = (top6Impressions > 0) ? ((double) top6Interactions / top6Impressions) * 100.0 : 0.0;

        RecommendationDailyMetric metric = dailyMetricRepository.findByReportDate(date)
                .orElse(RecommendationDailyMetric.builder().reportDate(date).build());

        metric.setTotalImpressions(impressions);
        metric.setTotalClicks(clicks);
        metric.setTotalBookings(bookings);
        metric.setCtr(Math.round(ctr * 100.0) / 100.0);
        metric.setPrecisionAt3(Math.round(pAt3 * 100.0) / 100.0);
        metric.setPrecisionAt6(Math.round(pAt6 * 100.0) / 100.0);
        metric.setCalculatedAt(LocalDateTime.now());

        return dailyMetricRepository.save(metric);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecommendationDailyMetric> getRecentMetrics() {
        return dailyMetricRepository.findTop30ByOrderByReportDateDesc();
    }

    // ================= HELPER & MATHEMATICAL METHODS =================

    public double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        double phi1 = Math.toRadians(lat1);
        double phi2 = Math.toRadians(lat2);
        double deltaPhi = Math.toRadians(lat2 - lat1);
        double deltaLambda = Math.toRadians(lon2 - lon1);

        double a = Math.sin(deltaPhi / 2.0) * Math.sin(deltaPhi / 2.0)
                + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2.0) * Math.sin(deltaLambda / 2.0);
        double c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
        return 6371.0 * c;
    }

    public double calculateGaussianDistanceScore(double distanceKm, double sigmaKm) {
        return Math.exp(- (distanceKm * distanceKm) / (2.0 * sigmaKm * sigmaKm));
    }

    public double calculateSportMatchScore(Long venueSportId, Long primarySportId, Set<Long> secondarySportIds) {
        if (venueSportId == null) return 0.1;
        if (primarySportId != null && primarySportId.equals(venueSportId)) {
            return 1.0;
        }
        if (secondarySportIds != null && secondarySportIds.contains(venueSportId)) {
            return 0.6;
        }
        return 0.1;
    }

    public double calculatePriceAffinityScore(Double venueAvgPrice, Double userAvgPrice, Double priceRange) {
        if (venueAvgPrice == null || userAvgPrice == null || priceRange == null || priceRange <= 0) {
            return 0.5;
        }
        double diff = Math.abs(venueAvgPrice - userAvgPrice);
        double score = 1.0 - (diff / priceRange);
        return Math.max(0.0, Math.min(1.0, score));
    }

    public double calculatePopularityScore(Double rating, Long bookingCount) {
        double r = (rating != null && rating > 0.0) ? Math.min(5.0, Math.max(1.0, rating)) : 4.5;
        double b = (bookingCount != null && bookingCount > 0) ? bookingCount : 0.0;
        double ratingPart = 0.6 * (r / 5.0);
        double bookingPart = 0.4 * Math.min(1.0, Math.log(1.0 + b) / Math.log(101.0));
        return Math.min(1.0, ratingPart + bookingPart);
    }

    public double calculateHistoryScore(int bookingCountAtVenue) {
        return Math.min(1.0, bookingCountAtVenue / 3.0);
    }

    public double[] calculateBoundingBox(double lat, double lng, double radiusKm) {
        double deltaLat = radiusKm / 111.0;
        double latRad = Math.toRadians(lat);
        double cosLat = Math.cos(latRad);
        if (Math.abs(cosLat) < 1e-6) {
            cosLat = 1e-6;
        }
        double deltaLng = radiusKm / (111.0 * cosLat);
        return new double[]{
                lat - deltaLat, lat + deltaLat,
                lng - deltaLng, lng + deltaLng
        };
    }

    private List<Venue> fetchCandidateVenues(Double latitude, Double longitude, Long filterSportId, int targetLimit) {
        List<Venue> candidates = new ArrayList<>();
        if (latitude != null && longitude != null) {
            // Step 1: initial radius (15km) WITH sport filter
            double[] box1 = calculateBoundingBox(latitude, longitude, properties.getParameters().getInitialRadiusKm());
            candidates = venueRepository.findInBoundingBox(
                    VenueStatus.ACTIVE, ApprovalStatus.APPROVED, filterSportId,
                    box1[0], box1[1], box1[2], box1[3]
            );

            // Step 2: If candidates < targetLimit, expand radius to 30km WITH sport filter
            if (candidates.size() < targetLimit) {
                double[] box2 = calculateBoundingBox(latitude, longitude, properties.getParameters().getExpandedRadiusKm());
                candidates = venueRepository.findInBoundingBox(
                        VenueStatus.ACTIVE, ApprovalStatus.APPROVED, filterSportId,
                        box2[0], box2[1], box2[2], box2[3]
                );
            }
        }

        // Step 3: If still < targetLimit, fetch all active approved venues (filtered by sport)
        if (candidates.size() < targetLimit) {
            List<Venue> allActive;
            if (filterSportId != null) {
                allActive = venueRepository.findByStatusAndApprovalStatusAndSportId(VenueStatus.ACTIVE, ApprovalStatus.APPROVED, filterSportId);
            } else {
                allActive = venueRepository.findByStatusAndApprovalStatus(VenueStatus.ACTIVE, ApprovalStatus.APPROVED);
            }
            for (Venue v : allActive) {
                if (!candidates.contains(v)) {
                    candidates.add(v);
                }
            }
        }

        return candidates;
    }

    private UserPreferenceProfile analyzeUserPreferences(List<Booking> bookings) {
        UserPreferenceProfile profile = new UserPreferenceProfile();
        if (bookings == null || bookings.isEmpty()) {
            return profile;
        }

        Map<Long, Integer> sportFreq = new HashMap<>();
        Map<UUID, Integer> venueFreq = new HashMap<>();
        double totalPrice = 0.0;
        int priceCount = 0;

        for (Booking b : bookings) {
            if (b.getVenue() != null) {
                venueFreq.put(b.getVenue().getId(), venueFreq.getOrDefault(b.getVenue().getId(), 0) + 1);
                if (b.getVenue().getSport() != null) {
                    Long sId = b.getVenue().getSport().getId();
                    sportFreq.put(sId, sportFreq.getOrDefault(sId, 0) + 1);
                }
            }
            if (b.getFinalPrice() != null && b.getFinalPrice() > 0) {
                totalPrice += b.getFinalPrice();
                priceCount++;
            }
        }

        // Find primary sport
        Long primarySportId = null;
        int maxCount = 0;
        Set<Long> secondarySports = new HashSet<>();
        for (Map.Entry<Long, Integer> entry : sportFreq.entrySet()) {
            if (entry.getValue() > maxCount) {
                maxCount = entry.getValue();
                primarySportId = entry.getKey();
            }
            secondarySports.add(entry.getKey());
        }
        if (primarySportId != null) {
            secondarySports.remove(primarySportId);
        }

        profile.primarySportId = primarySportId;
        profile.secondarySportIds = secondarySports;
        profile.avgPrice = (priceCount > 0) ? (totalPrice / priceCount) : 200000.0;
        profile.venueBookingCounts = venueFreq;
        return profile;
    }

    private static class UserPreferenceProfile {
        Long primarySportId = null;
        Set<Long> secondarySportIds = new HashSet<>();
        Double avgPrice = 200000.0;
        Map<UUID, Integer> venueBookingCounts = new HashMap<>();
    }

    private static class ScoredVenue {
        Venue venue;
        int matchScore;
        Double distanceKm;
        String reasonType;
        String reasonTag;
        int pastBookingCount;

        public ScoredVenue(Venue venue, int matchScore, Double distanceKm, String reasonType, String reasonTag, int pastBookingCount) {
            this.venue = venue;
            this.matchScore = matchScore;
            this.distanceKm = distanceKm;
            this.reasonType = reasonType;
            this.reasonTag = reasonTag;
            this.pastBookingCount = pastBookingCount;
        }
    }
}
