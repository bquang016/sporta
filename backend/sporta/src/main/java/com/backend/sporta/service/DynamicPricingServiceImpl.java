package com.backend.sporta.service;

import com.backend.sporta.config.DynamicPricingProperties;
import com.backend.sporta.dto.ApplyPricingRequest;
import com.backend.sporta.dto.PricingAnalyticsSummaryResponse;
import com.backend.sporta.dto.PricingRecommendationResponse;
import com.backend.sporta.dto.RejectPricingRequest;
import com.backend.sporta.entity.*;
import com.backend.sporta.enums.*;
import com.backend.sporta.exception.CustomException;
import com.backend.sporta.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DynamicPricingServiceImpl implements DynamicPricingService {

    private final CourtRepository courtRepository;
    private final VenueRepository venueRepository;
    private final BookingDetailRepository bookingDetailRepository;
    private final CourtPriceRuleRepository courtPriceRuleRepository;
    private final DemandForecastMetricRepository demandForecastMetricRepository;
    private final PricingRecommendationRepository pricingRecommendationRepository;
    private final PricingActionLogRepository pricingActionLogRepository;
    private final UserRepository userRepository;
    private final OwnerRepository ownerRepository;
    private final DynamicPricingProperties properties;

    // In-memory cache for fast UI retrieval
    private final Map<UUID, CachedVenueRecommendations> venueRecommendationCache = new ConcurrentHashMap<>();
    private final Map<String, Double> dynamicSportBenchmarkCache = new ConcurrentHashMap<>();

    private static class CachedVenueRecommendations {
        List<PricingRecommendationResponse> data;
        LocalDateTime cachedAt;

        CachedVenueRecommendations(List<PricingRecommendationResponse> data) {
            this.data = data;
            this.cachedAt = LocalDateTime.now();
        }

        boolean isExpired(int ttlHours) {
            return cachedAt.plusHours(ttlHours).isBefore(LocalDateTime.now());
        }
    }

    // ================= 1. BATCH SCHEDULER EXECUTION =================

    @Override
    @Transactional
    public void runDailyDynamicPricingBatch() {
        log.info("Bắt đầu chạy batch phân tích dự báo nhu cầu & định giá động (03:00 AM)...");
        LocalDateTime now = LocalDateTime.now();
        LocalDate today = now.toLocalDate();
        int evalWeeks = properties.getWindow().getEvaluationWeeks();
        LocalDate windowStartDate = today.minusWeeks(evalWeeks);

        // 1. Tự động tính toán & cache Sport Benchmarks
        calculateAndCacheSportBenchmarks();

        // 2. Đánh dấu EXPIRED cho các recommendation PENDING quá hạn
        int expiredCount = pricingRecommendationRepository.expireOutdatedRecommendations(now);
        log.info("Đã đánh dấu hết hạn {} đề xuất giá cũ quá hạn.", expiredCount);

        // 3. Lấy tất cả sân active của các cơ sở đã duyệt
        List<Venue> activeVenues = venueRepository.findByStatusAndApprovalStatus(VenueStatus.ACTIVE, ApprovalStatus.APPROVED);
        if (activeVenues.isEmpty()) {
            log.info("Không có cơ sở thể thao nào hoạt động để định giá động.");
            return;
        }

        for (Venue venue : activeVenues) {
            List<Court> activeCourts = courtRepository.findByVenueId(venue.getId()).stream()
                    .filter(c -> c.getStatus() == CourtStatus.ACTIVE)
                    .collect(Collectors.toList());

            if (activeCourts.isEmpty()) continue;

            LocalTime openTime = venue.getOpeningTime() != null ? venue.getOpeningTime() : LocalTime.of(6, 0);
            LocalTime closeTime = venue.getClosingTime() != null ? venue.getClosingTime() : LocalTime.of(22, 0);
            int shiftMinutes = venue.getShiftDurationMinutes() != null ? venue.getShiftDurationMinutes() : 60;

            String sportKey = venue.getSport() != null ? venue.getSport().getName().toUpperCase() : "DEFAULT";
            double sportBenchmark = getSportBenchmark(sportKey);

            for (Court court : activeCourts) {
                // Tính số tuần court đã tồn tại trong cửa sổ 6 tuần
                int preCreationWeeks = 0;
                if (court.getCreatedAt() != null) {
                    LocalDate courtCreatedDate = court.getCreatedAt().toLocalDate();
                    if (courtCreatedDate.isAfter(windowStartDate)) {
                        long daysBefore = ChronoUnit.DAYS.between(windowStartDate, courtCreatedDate);
                        preCreationWeeks = (int) (daysBefore / 7);
                    }
                }
                int activeWeeksEvaluated = Math.max(0, evalWeeks - preCreationWeeks);
                double alpha = Math.min(1.0, activeWeeksEvaluated / (double) properties.getWindow().getColdStartMinWeeks());

                // Xác định confidence level
                ConfidenceLevel confidenceLevel;
                if (activeWeeksEvaluated >= 5) {
                    confidenceLevel = ConfidenceLevel.HIGH;
                } else if (activeWeeksEvaluated >= 2) {
                    confidenceLevel = ConfidenceLevel.MEDIUM;
                } else {
                    confidenceLevel = ConfidenceLevel.LOW;
                }

                // Duyệt qua 7 ngày trong tuần
                for (int dayOfWeek = 1; dayOfWeek <= 7; dayOfWeek++) {
                    LocalTime currentSlot = openTime;
                    while (currentSlot.isBefore(closeTime)) {
                        LocalTime nextSlot = currentSlot.plusMinutes(shiftMinutes);
                        if (nextSlot.isAfter(closeTime)) break;

                        // Đếm số booking đã đặt thành công cho slot này trong cửa sổ 6 tuần
                        List<BookingDetail> historicalBookings = bookingDetailRepository
                                .findByCourtIdAndBookingDateAndBookingStatusIn(
                                        court.getId(),
                                        today.minusWeeks(evalWeeks), // Query from start of window
                                        List.of(BookingStatus.CONFIRMED, BookingStatus.COMPLETED)
                                );

                        // Lọc các booking đúng dayOfWeek và startTime trong 6 tuần qua
                        int finalDayOfWeek = dayOfWeek;
                        LocalTime finalSlotStart = currentSlot;
                        long bookedCount = historicalBookings.stream()
                                .filter(b -> b.getBookingDate().getDayOfWeek().getValue() == finalDayOfWeek
                                        && b.getStartTime().equals(finalSlotStart))
                                .count();

                        double localOccupancyRate = (activeWeeksEvaluated > 0)
                                ? Math.min(1.0, bookedCount / (double) activeWeeksEvaluated)
                                : 0.0;

                        // Blended effective occupancy rate
                        double effectiveOccupancyRate = alpha * localOccupancyRate + (1.0 - alpha) * sportBenchmark;

                        // Lưu hoặc cập nhật snapshot metric
                        DemandForecastMetric metric = demandForecastMetricRepository
                                .findByCourtIdAndDayOfWeekAndStartTime(court.getId(), dayOfWeek, currentSlot)
                                .orElse(DemandForecastMetric.builder()
                                        .court(court)
                                        .dayOfWeek(dayOfWeek)
                                        .startTime(currentSlot)
                                        .endTime(nextSlot)
                                        .build());
                        metric.setOccupancyRate(effectiveOccupancyRate);
                        metric.setActiveWeeksEvaluated(activeWeeksEvaluated);
                        metric.setBookedSlotsCount((int) bookedCount);
                        metric.setCalculatedAt(now);
                        demandForecastMetricRepository.save(metric);

                        // Tính toán các hệ số giá
                        double basePrice = (court.getPrice() != null) ? court.getPrice() : 100000.0;
                        double dayFactor = calculateDayFactor(dayOfWeek);
                        double timeSlotFactor = calculateTimeSlotFactor(dayOfWeek, currentSlot);
                        double occupancyFactor = calculateOccupancyFactor(effectiveOccupancyRate);

                        double rawPrice = basePrice * dayFactor * timeSlotFactor * occupancyFactor;
                        double finalSuggestedPrice = calculateFinalSuggestedPrice(basePrice, dayFactor, timeSlotFactor, occupancyFactor);

                        double diffPercentage = Math.round(((finalSuggestedPrice - basePrice) / basePrice) * 1000.0) / 10.0;

                        // Tạo chuỗi lý giải đề xuất trực quan cho Chủ sân
                        String reason = generateRecommendationReason(
                                dayOfWeek, currentSlot, effectiveOccupancyRate, diffPercentage, confidenceLevel
                        );

                        // Upsert recommendation
                        Optional<PricingRecommendation> existingOpt = pricingRecommendationRepository
                                .findPendingByCourtAndSlot(court.getId(), dayOfWeek, currentSlot);

                        PricingRecommendation recommendation;
                        if (existingOpt.isPresent()) {
                            recommendation = existingOpt.get();
                        } else {
                            recommendation = PricingRecommendation.builder()
                                    .court(court)
                                    .dayOfWeek(dayOfWeek)
                                    .startTime(currentSlot)
                                    .endTime(nextSlot)
                                    .build();
                        }

                        recommendation.setCreatedAt(now);
                        recommendation.setBasePrice(basePrice);
                        recommendation.setDayFactor(dayFactor);
                        recommendation.setTimeSlotFactor(timeSlotFactor);
                        recommendation.setOccupancyFactor(occupancyFactor);
                        recommendation.setOccupancyRate(effectiveOccupancyRate);
                        recommendation.setRawPrice(rawPrice);
                        recommendation.setSuggestedPrice(finalSuggestedPrice);
                        recommendation.setPriceChangePercentage(diffPercentage);
                        recommendation.setRecommendationReason(reason);
                        recommendation.setConfidenceLevel(confidenceLevel);
                        recommendation.setStatus(RecommendationStatus.PENDING);
                        recommendation.setExpiresAt(now.plusHours(properties.getScheduler().getRecommendationTtlHours()));

                        pricingRecommendationRepository.save(recommendation);

                        currentSlot = nextSlot;
                    }
                }
            }

            // Xóa cache venue sau khi sinh xong batch mới
            venueRecommendationCache.remove(venue.getId());
        }

        log.info("Hoàn tất batch định giá động thành công cho {} cơ sở thể thao.", activeVenues.size());
    }

    // ================= 2. SPORT BENCHMARKS CALCULATION =================

    @Override
    @Transactional(readOnly = true)
    public Map<String, Double> calculateAndCacheSportBenchmarks() {
        Map<String, Double> benchmarks = new HashMap<>(properties.getDefaultSportBenchmarks());

        // Lấy tất cả môn thể thao
        List<Venue> allVenues = venueRepository.findAll();
        Map<String, List<UUID>> sportVenuesMap = new HashMap<>();
        for (Venue v : allVenues) {
            if (v.getSport() != null && v.getSport().getName() != null) {
                String sKey = v.getSport().getName().toUpperCase();
                sportVenuesMap.computeIfAbsent(sKey, k -> new ArrayList<>()).add(v.getId());
            }
        }

        // Với mỗi môn, tính trung bình occupancy nếu có dữ liệu
        for (Map.Entry<String, List<UUID>> entry : sportVenuesMap.entrySet()) {
            String sportKey = entry.getKey();
            List<UUID> vIds = entry.getValue();
            if (!vIds.isEmpty()) {
                double defaultVal = properties.getDefaultSportBenchmarks().getOrDefault(sportKey, 0.55);
                benchmarks.put(sportKey, defaultVal);
            }
        }

        dynamicSportBenchmarkCache.putAll(benchmarks);
        return benchmarks;
    }

    private double getSportBenchmark(String sportKey) {
        if (dynamicSportBenchmarkCache.containsKey(sportKey)) {
            return dynamicSportBenchmarkCache.get(sportKey);
        }
        return properties.getDefaultSportBenchmarks().getOrDefault(sportKey,
                properties.getDefaultSportBenchmarks().getOrDefault("DEFAULT", 0.55));
    }

    // ================= 3. GET RECOMMENDATIONS FOR OWNER =================

    @Override
    @Transactional(readOnly = true)
    public List<PricingRecommendationResponse> getRecommendationsForVenue(UUID venueId, String ownerEmail) {
        validateOwnerVenueAccess(venueId, ownerEmail);

        // Check in-memory cache
        CachedVenueRecommendations cached = venueRecommendationCache.get(venueId);
        if (cached != null && !cached.isExpired(properties.getScheduler().getRecommendationTtlHours())) {
            return cached.data;
        }

        List<PricingRecommendation> recommendations = pricingRecommendationRepository
                .findByVenueIdAndStatus(venueId, RecommendationStatus.PENDING);

        List<PricingRecommendationResponse> responseList = recommendations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        venueRecommendationCache.put(venueId, new CachedVenueRecommendations(responseList));
        return responseList;
    }

    // ================= 4. APPROVAL FLOW (APPLY RECOMMENDATIONS) =================

    @Override
    @Transactional
    public void applyRecommendations(ApplyPricingRequest request, String ownerEmail) {
        if (request.getRecommendationIds() == null || request.getRecommendationIds().isEmpty()) {
            throw new CustomException("Danh sách recommendationIds không được để trống", 400);
        }

        User ownerUser = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new CustomException("Không tìm thấy chủ sân", 404));

        Set<UUID> affectedVenueIds = new HashSet<>();

        for (UUID recId : request.getRecommendationIds()) {
            PricingRecommendation rec = pricingRecommendationRepository.findById(recId)
                    .orElseThrow(() -> new CustomException("Không tìm thấy đề xuất: " + recId, 404));

            Venue venue = rec.getCourt().getVenue();
            validateOwnerVenueAccess(venue.getId(), ownerEmail);
            affectedVenueIds.add(venue.getId());

            double priceToApply = rec.getSuggestedPrice();
            PricingActionType actionType = PricingActionType.APPLY;

            if (request.getCustomPrices() != null && request.getCustomPrices().containsKey(recId)) {
                Double custom = request.getCustomPrices().get(recId);
                if (custom != null && custom > 0) {
                    priceToApply = Math.round(custom / 1000.0) * 1000.0;
                    actionType = PricingActionType.CUSTOMIZE;
                }
            }

            // Cập nhật hoặc tạo mới CourtPriceRule (ưu tiên rule SHIFT)
            Court court = rec.getCourt();
            List<CourtPriceRule> existingRules = courtPriceRuleRepository.findByCourtId(court.getId());

            LocalTime startTime = rec.getStartTime();
            LocalTime endTime = rec.getEndTime();
            Integer dayOfWeek = rec.getDayOfWeek();

            CourtPriceRule matchedRule = null;
            for (CourtPriceRule r : existingRules) {
                if (r.getRuleType() == PriceRuleType.SHIFT
                        && Objects.equals(r.getStartTime(), startTime)
                        && Objects.equals(r.getEndTime(), endTime)) {
                    matchedRule = r;
                    break;
                }
            }

            if (matchedRule != null) {
                matchedRule.setCustomPrice(priceToApply);
                courtPriceRuleRepository.save(matchedRule);
            } else {
                CourtPriceRule newRule = CourtPriceRule.builder()
                        .court(court)
                        .ruleType(PriceRuleType.SHIFT)
                        .startTime(startTime)
                        .endTime(endTime)
                        .customPrice(priceToApply)
                        .build();
                courtPriceRuleRepository.save(newRule);
            }

            // Đánh dấu recommendation đã áp dụng
            rec.setStatus(RecommendationStatus.APPLIED);
            pricingRecommendationRepository.save(rec);

            // Ghi nhận log quyết định
            PricingActionLog logEntry = PricingActionLog.builder()
                    .recommendationId(rec.getId())
                    .court(court)
                    .ownerId(ownerUser.getId())
                    .actionType(actionType)
                    .originalPrice(rec.getBasePrice())
                    .suggestedPrice(rec.getSuggestedPrice())
                    .appliedPrice(priceToApply)
                    .actionTimestamp(LocalDateTime.now())
                    .build();
            pricingActionLogRepository.save(logEntry);
        }

        // Xóa cache các venue bị ảnh hưởng
        for (UUID vId : affectedVenueIds) {
            venueRecommendationCache.remove(vId);
        }
    }

    // ================= 5. REJECTION FLOW =================

    @Override
    @Transactional
    public void rejectRecommendations(RejectPricingRequest request, String ownerEmail) {
        if (request.getRecommendationIds() == null || request.getRecommendationIds().isEmpty()) {
            throw new CustomException("Danh sách recommendationIds không được để trống", 400);
        }

        User ownerUser = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new CustomException("Không tìm thấy chủ sân", 404));

        Set<UUID> affectedVenueIds = new HashSet<>();

        for (UUID recId : request.getRecommendationIds()) {
            PricingRecommendation rec = pricingRecommendationRepository.findById(recId)
                    .orElseThrow(() -> new CustomException("Không tìm thấy đề xuất: " + recId, 404));

            Venue venue = rec.getCourt().getVenue();
            validateOwnerVenueAccess(venue.getId(), ownerEmail);
            affectedVenueIds.add(venue.getId());

            rec.setStatus(RecommendationStatus.REJECTED);
            pricingRecommendationRepository.save(rec);

            // Ghi nhận log từ chối
            PricingActionLog logEntry = PricingActionLog.builder()
                    .recommendationId(rec.getId())
                    .court(rec.getCourt())
                    .ownerId(ownerUser.getId())
                    .actionType(PricingActionType.REJECT)
                    .originalPrice(rec.getBasePrice())
                    .suggestedPrice(rec.getSuggestedPrice())
                    .rejectionReason(request.getReason())
                    .actionTimestamp(LocalDateTime.now())
                    .build();
            pricingActionLogRepository.save(logEntry);
        }

        for (UUID vId : affectedVenueIds) {
            venueRecommendationCache.remove(vId);
        }
    }

    // ================= 6. ANALYTICS & HEATMAP SUMMARY =================

    @Override
    @Transactional(readOnly = true)
    public PricingAnalyticsSummaryResponse getPricingAnalytics(
            UUID venueId,
            UUID courtId,
            Integer dayOfWeek,
            String ownerEmail
    ) {
        validateOwnerVenueAccess(venueId, ownerEmail);
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new CustomException("Không tìm thấy cụm sân", 404));

        List<PricingRecommendation> allRecs = pricingRecommendationRepository.findRecentByVenueId(venueId);
        long pendingCount = allRecs.stream().filter(r -> r.getStatus() == RecommendationStatus.PENDING).count();
        long appliedCount = pricingActionLogRepository.countAppliedByVenueId(venueId);
        long rejectedCount = pricingActionLogRepository.countRejectedByVenueId(venueId);

        double acceptanceRate = (appliedCount + rejectedCount > 0)
                ? Math.round(((double) appliedCount / (appliedCount + rejectedCount)) * 1000.0) / 10.0
                : 0.0;

        // Xây dựng heatmap dữ liệu (chỉ query courtId được chọn nếu có để tối ưu hiệu năng)
        List<Court> courts = courtRepository.findByVenueId(venueId);
        if (courtId != null) {
            courts = courts.stream().filter(c -> c.getId().equals(courtId)).collect(Collectors.toList());
        }

        List<PricingAnalyticsSummaryResponse.CourtHeatmapDto> courtHeatmaps = new ArrayList<>();

        for (Court court : courts) {
            List<DemandForecastMetric> metrics = demandForecastMetricRepository.findByCourtId(court.getId());
            if (dayOfWeek != null) {
                metrics = metrics.stream().filter(m -> Objects.equals(m.getDayOfWeek(), dayOfWeek)).collect(Collectors.toList());
            }

            List<PricingRecommendation> courtPendingRecs = pricingRecommendationRepository
                    .findByCourtIdAndStatus(court.getId(), RecommendationStatus.PENDING);

            Map<String, Double> suggestedMap = new HashMap<>();
            for (PricingRecommendation r : courtPendingRecs) {
                if (r.getDayOfWeek() != null && r.getStartTime() != null && r.getSuggestedPrice() != null) {
                    suggestedMap.put(r.getDayOfWeek() + "_" + r.getStartTime(), r.getSuggestedPrice());
                }
            }

            List<PricingAnalyticsSummaryResponse.SlotHeatmapItem> slotItems = metrics.stream()
                    .map(m -> PricingAnalyticsSummaryResponse.SlotHeatmapItem.builder()
                            .dayOfWeek(m.getDayOfWeek() != null ? m.getDayOfWeek() : 1)
                            .startTime(m.getStartTime() != null ? m.getStartTime().toString() : "00:00")
                            .endTime(m.getEndTime() != null ? m.getEndTime().toString() : "01:00")
                            .occupancyRate(m.getOccupancyRate() != null ? m.getOccupancyRate() : 0.0)
                            .bookedCount(m.getBookedSlotsCount() != null ? m.getBookedSlotsCount() : 0)
                            .activeWeeks(m.getActiveWeeksEvaluated() != null ? m.getActiveWeeksEvaluated() : 0)
                            .currentPrice(court.getPrice() != null ? court.getPrice() : 0.0)
                            .suggestedPrice(suggestedMap.get((m.getDayOfWeek() != null ? m.getDayOfWeek() : 1) + "_" + (m.getStartTime() != null ? m.getStartTime() : "")))
                            .build())
                    .sorted(Comparator.comparingInt(PricingAnalyticsSummaryResponse.SlotHeatmapItem::getDayOfWeek)
                            .thenComparing(item -> item.getStartTime() != null ? item.getStartTime() : ""))
                    .collect(Collectors.toList());

            courtHeatmaps.add(PricingAnalyticsSummaryResponse.CourtHeatmapDto.builder()
                    .courtId(court.getId())
                    .courtName(court.getName())
                    .slots(slotItems)
                    .build());
        }

        int lookbackWeeks = (properties.getWindow() != null && properties.getWindow().getEvaluationWeeks() != null)
                ? properties.getWindow().getEvaluationWeeks()
                : 6;

        LocalDate today = LocalDate.now();
        LocalDate evalStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate evalEnd = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
        LocalDate historyEnd = evalStart.minusDays(1);
        LocalDate historyStart = historyEnd.minusWeeks(lookbackWeeks).plusDays(1);

        LocalDateTime lastAnalyzedAt = allRecs.stream()
                .map(PricingRecommendation::getCreatedAt)
                .filter(Objects::nonNull)
                .max(LocalDateTime::compareTo)
                .orElse(null);

        if (lastAnalyzedAt == null) {
            for (Court court : courts) {
                List<DemandForecastMetric> metrics = demandForecastMetricRepository.findByCourtId(court.getId());
                for (DemandForecastMetric m : metrics) {
                    if (m.getCalculatedAt() != null) {
                        if (lastAnalyzedAt == null || m.getCalculatedAt().isAfter(lastAnalyzedAt)) {
                            lastAnalyzedAt = m.getCalculatedAt();
                        }
                    }
                }
            }
        }
        if (lastAnalyzedAt == null) {
            lastAnalyzedAt = LocalDateTime.now();
        }

        return PricingAnalyticsSummaryResponse.builder()
                .venueId(venue.getId())
                .venueName(venue.getName())
                .totalPendingRecommendations(pendingCount)
                .totalAppliedRecommendations(appliedCount)
                .totalRejectedRecommendations(rejectedCount)
                .acceptanceRate(acceptanceRate)
                .lastAnalyzedAt(lastAnalyzedAt)
                .evaluationPeriodStart(evalStart)
                .evaluationPeriodEnd(evalEnd)
                .historicalLookbackWeeks(lookbackWeeks)
                .historicalLookbackStart(historyStart)
                .historicalLookbackEnd(historyEnd)
                .courtHeatmaps(courtHeatmaps)
                .build();
    }

    // ================= 7. MATHEMATICAL CORE ENGINE METHODS =================

    @Override
    public double calculateOccupancyFactor(double occupancyRate) {
        double orLow = properties.getOccupancyThresholds().getDeadbandMin(); // 0.40
        double orHigh = properties.getOccupancyThresholds().getDeadbandMax(); // 0.70
        double maxDec = properties.getOccupancyFactors().getMaxDiscountPercentage(); // 0.15
        double maxInc = properties.getOccupancyFactors().getMaxSurgePercentage(); // 0.20

        if (occupancyRate < orLow) {
            // Vùng thấp điểm: Giảm giá kích cầu
            double factor = 1.0 - maxDec * ((orLow - occupancyRate) / orLow);
            return Math.max(1.0 - maxDec, Math.min(1.0, factor));
        } else if (occupancyRate > orHigh) {
            // Vùng cao điểm: Tăng giá tối ưu doanh thu
            double factor = 1.0 + maxInc * ((occupancyRate - orHigh) / (1.0 - orHigh));
            return Math.min(1.0 + maxInc, Math.max(1.0, factor));
        } else {
            // Vùng cân bằng (Deadband)
            return 1.00;
        }
    }

    @Override
    public double calculateDayFactor(int dayOfWeek) {
        if (dayOfWeek == 5) {
            return properties.getDayFactors().getFriday(); // 1.02
        } else if (dayOfWeek == 6 || dayOfWeek == 7) {
            return properties.getDayFactors().getWeekend(); // 1.08
        } else {
            return properties.getDayFactors().getWeekday(); // 0.96 (T2..T5)
        }
    }

    @Override
    public double calculateTimeSlotFactor(int dayOfWeek, LocalTime slotTime) {
        if (slotTime == null) return properties.getSlotFactors().getStandard();

        LocalTime t0500 = LocalTime.of(5, 0);
        LocalTime t0600 = LocalTime.of(6, 0);
        LocalTime t0800 = LocalTime.of(8, 0);
        LocalTime t1000 = LocalTime.of(10, 0);
        LocalTime t1530 = LocalTime.of(15, 30);
        LocalTime t1600 = LocalTime.of(16, 0);
        LocalTime t2130 = LocalTime.of(21, 30);
        LocalTime t2200 = LocalTime.of(22, 0);
        LocalTime t2300 = LocalTime.of(23, 0);

        boolean isWeekend = (dayOfWeek == 6 || dayOfWeek == 7);

        if (!isWeekend) {
            // Ngày thường (T2 - T5 & T6 slot daytime)
            if (!slotTime.isBefore(t0800) && slotTime.isBefore(t1600)) {
                return properties.getSlotFactors().getWeekdayLowPeak(); // 0.92
            } else if (!slotTime.isBefore(t1600) && slotTime.isBefore(t2130)) {
                return properties.getSlotFactors().getWeekdayGoldenPeak(); // 1.10
            } else {
                return properties.getSlotFactors().getStandard(); // 1.00
            }
        } else {
            // Cuối tuần (T7, CN)
            if (!slotTime.isBefore(t0600) && slotTime.isBefore(t1000)) {
                return properties.getSlotFactors().getWeekendGoldenPeak(); // 1.10
            } else if (!slotTime.isBefore(t1530) && slotTime.isBefore(t2200)) {
                return properties.getSlotFactors().getWeekendGoldenPeak(); // 1.10
            } else {
                return properties.getSlotFactors().getStandard(); // 1.00 (bao gồm 10:00 - 15:30 trưa cuối tuần)
            }
        }
    }

    @Override
    public double calculateFinalSuggestedPrice(
            double basePrice,
            double dayFactor,
            double timeSlotFactor,
            double occupancyFactor
    ) {
        double rawPrice = basePrice * dayFactor * timeSlotFactor * occupancyFactor;

        double maxInc = properties.getEnvelope().getMaxIncreasePercentage(); // 0.20
        double maxDec = properties.getEnvelope().getMaxDecreasePercentage(); // 0.20

        double absMin = properties.getConstraints().getAbsoluteMinPrice(); // 50.000
        double absMax = properties.getConstraints().getAbsoluteMaxPrice(); // 2.000.000
        double step = properties.getConstraints().getRoundingStep(); // 5.000

        // Lớp 1 & 2: Kẹp biên an toàn toàn cục
        double pFloor = Math.max(basePrice * (1.0 - maxDec), absMin);
        double pCeiling = Math.min(basePrice * (1.0 + maxInc), absMax);

        double pClamped = Math.min(pCeiling, Math.max(pFloor, rawPrice));

        // Lớp 3: Làm tròn an toàn hướng tâm (Inward Safe Rounding)
        double standardRounded = Math.round(pClamped / step) * step;

        if (standardRounded < pFloor) {
            // Nếu làm tròn thông thường bị tụt dưới sàn -> Làm tròn LÊN vào vùng an toàn
            return Math.ceil(pFloor / step) * step;
        } else if (standardRounded > pCeiling) {
            // Nếu làm tròn thông thường bị vượt trần -> Làm tròn XUỐNG vào vùng an toàn
            return Math.floor(pCeiling / step) * step;
        } else {
            return standardRounded;
        }
    }

    // ================= HELPER METHODS =================

    private void validateOwnerVenueAccess(UUID venueId, String ownerEmail) {
        if (ownerEmail == null || ownerEmail.trim().isEmpty()) {
            throw new CustomException("Chưa đăng nhập", 401);
        }
        User user = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));

        if (user.getRole() == Role.ADMIN || user.getRole() == Role.SUPER_ADMIN) {
            return;
        }

        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new CustomException("Không tìm thấy cụm sân", 404));

        if (venue.getOwner() == null || venue.getOwner().getUser() == null
                || !venue.getOwner().getUser().getId().equals(user.getId())) {
            throw new CustomException("Bạn không có quyền quản lý cơ sở thể thao này", 403);
        }
    }

    private String generateRecommendationReason(
            int dayOfWeek,
            LocalTime slotTime,
            double occupancyRate,
            double diffPercentage,
            ConfidenceLevel confidence
    ) {
        String dowName = getDayOfWeekLabel(dayOfWeek);
        String timeStr = slotTime.toString();
        int orPercent = (int) Math.round(occupancyRate * 100.0);

        if (diffPercentage > 0) {
            return String.format("[Nhu cầu cao] Khung giờ %s lúc %s: Tỷ lệ lấp đầy đạt %d%%. Đề xuất tăng giá +%.1f%% để tối ưu doanh thu.",
                    dowName, timeStr, orPercent, diffPercentage);
        } else if (diffPercentage < 0) {
            return String.format("[Nhu cầu thấp] Khung giờ %s lúc %s: Tỷ lệ lấp đầy chỉ %d%%. Đề xuất giảm giá %.1f%% nhằm kích cầu đặt sân.",
                    dowName, timeStr, orPercent, Math.abs(diffPercentage));
        } else {
            return String.format("[Nhu cầu ổn định] Khung giờ %s lúc %s: Nhu cầu ở mức cân bằng (%d%%). Giữ nguyên mức giá cơ sở.",
                    dowName, timeStr, orPercent);
        }
    }

    private String getDayOfWeekLabel(int dayOfWeek) {
        return switch (dayOfWeek) {
            case 1 -> "Thứ 2";
            case 2 -> "Thứ 3";
            case 3 -> "Thứ 4";
            case 4 -> "Thứ 5";
            case 5 -> "Thứ 6";
            case 6 -> "Thứ 7";
            case 7 -> "Chủ Nhật";
            default -> "Ngày " + dayOfWeek;
        };
    }

    private PricingRecommendationResponse mapToResponse(PricingRecommendation pr) {
        String dowLabel = getDayOfWeekLabel(pr.getDayOfWeek());
        String timeSlotLabel = pr.getStartTime() + " - " + pr.getEndTime();
        double priceDiff = pr.getSuggestedPrice() - pr.getBasePrice();

        LocalDate refDate = (pr.getCreatedAt() != null) ? pr.getCreatedAt().toLocalDate() : LocalDate.now();
        LocalDate effStart = refDate.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate effEnd = refDate.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        return PricingRecommendationResponse.builder()
                .id(pr.getId())
                .courtId(pr.getCourt().getId())
                .courtName(pr.getCourt().getName())
                .venueId(pr.getCourt().getVenue().getId())
                .venueName(pr.getCourt().getVenue().getName())
                .dayOfWeek(pr.getDayOfWeek())
                .dayOfWeekLabel(dowLabel)
                .startTime(pr.getStartTime())
                .endTime(pr.getEndTime())
                .timeSlotLabel(timeSlotLabel)
                .basePrice(pr.getBasePrice())
                .dayFactor(pr.getDayFactor())
                .timeSlotFactor(pr.getTimeSlotFactor())
                .occupancyFactor(pr.getOccupancyFactor())
                .occupancyRate(pr.getOccupancyRate())
                .rawPrice(pr.getRawPrice())
                .suggestedPrice(pr.getSuggestedPrice())
                .priceDifference(priceDiff)
                .priceChangePercentage(pr.getPriceChangePercentage())
                .recommendationReason(pr.getRecommendationReason())
                .confidenceLevel(pr.getConfidenceLevel())
                .status(pr.getStatus())
                .createdAt(pr.getCreatedAt())
                .expiresAt(pr.getExpiresAt())
                .effectiveDateStart(effStart)
                .effectiveDateEnd(effEnd)
                .build();
    }
}
