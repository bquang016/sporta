package com.backend.sporta.service;

import com.backend.sporta.enums.ApprovalStatus;
import com.backend.sporta.enums.BookingStatus;
import com.backend.sporta.enums.CourtStatus;
import com.backend.sporta.enums.PriceRuleType;
import com.backend.sporta.enums.VenueStatus;
import com.backend.sporta.dto.CourtPriceRuleResponse;
import com.backend.sporta.dto.CourtPublicResponse;
import com.backend.sporta.dto.SlotResponse;
import com.backend.sporta.dto.VenueDetailResponse;
import com.backend.sporta.dto.VenueRequest;
import com.backend.sporta.dto.VenueResponse;
import com.backend.sporta.entity.Booking;
import com.backend.sporta.entity.Court;
import com.backend.sporta.entity.CourtPriceRule;
import com.backend.sporta.entity.Owner;
import com.backend.sporta.entity.Sport;
import com.backend.sporta.entity.Venue;
import com.backend.sporta.entity.VenueImage;
import com.backend.sporta.entity.VenueRevision;
import com.backend.sporta.exception.CustomException;
import com.backend.sporta.repository.BookingDetailRepository;
import com.backend.sporta.repository.CourtPriceRuleRepository;
import com.backend.sporta.repository.TicketSessionRepository;
import com.backend.sporta.entity.TicketSession;
import com.backend.sporta.repository.OwnerRepository;
import com.backend.sporta.repository.SportRepository;
import com.backend.sporta.repository.VenueImageRepository;
import com.backend.sporta.repository.VenueRepository;
import com.backend.sporta.repository.VenueRevisionRepository;
import com.backend.sporta.repository.CourtRepository;
import com.backend.sporta.dto.CourtPriceRuleRequest;
import com.backend.sporta.dto.VenueDraftRequest;
import com.backend.sporta.dto.CourtDraftDto;
import com.backend.sporta.entity.Court;
import com.backend.sporta.entity.CourtPriceRule;
import com.backend.sporta.entity.VenuePolicy;
import com.backend.sporta.entity.OwnerContract;
import com.backend.sporta.repository.CourtPriceRuleRepository;
import com.backend.sporta.repository.OwnerContractRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.domain.Specification;

import com.backend.sporta.dto.VenueSearchCriteriaDTO;
import com.backend.sporta.repository.specification.VenueSpecification;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VenueService {

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private OwnerRepository ownerRepository;

    @Autowired
    private SportRepository sportRepository;

    @Autowired
    private VenueImageRepository venueImageRepository;

    @Autowired
    private VenueRevisionRepository venueRevisionRepository;

    @Autowired
    private CourtRepository courtRepository;

    @Autowired
    private CourtPriceRuleRepository courtPriceRuleRepository;

    @Autowired
    private OwnerContractRepository ownerContractRepository;

    @Autowired
    private BookingDetailRepository bookingDetailRepository;

    @Autowired
    private TicketSessionRepository ticketSessionRepository;

    public List<VenueResponse> getVenuesByOwnerEmail(String email) {
        return venueRepository.findByOwnerUserEmail(email).stream()
                .map(venue -> mapToResponse(venue, checkHasPendingRevision(venue.getId())))
                .collect(Collectors.toList());
    }

    public List<VenueResponse> getAllActiveVenues() {
        return venueRepository.findByStatusAndApprovalStatus(
                com.backend.sporta.enums.VenueStatus.ACTIVE,
                com.backend.sporta.enums.ApprovalStatus.APPROVED).stream()
                .map(venue -> mapToResponse(venue, checkHasPendingRevision(venue.getId())))
                .collect(Collectors.toList());
    }

    /**
     * Lấy chi tiết một venue kèm danh sách courts và priceRules.
     * Endpoint public — không yêu cầu xác thực.
     */
    public VenueDetailResponse getVenueDetail(UUID venueId) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new CustomException("Không tìm thấy cụm sân", 404));

        List<Court> courts = courtRepository.findByVenueId(venueId);

        List<CourtPublicResponse> courtPublicList = courts.stream()
                .filter(c -> c.getStatus() == CourtStatus.ACTIVE)
                .map(court -> {
                    List<CourtPriceRule> rules = courtPriceRuleRepository.findByCourtId(court.getId());
                    List<CourtPriceRuleResponse> ruleResponses = rules.stream()
                            .map(r -> CourtPriceRuleResponse.builder()
                                    .id(r.getId())
                                    .courtId(r.getCourt().getId())
                                    .ruleType(r.getRuleType())
                                    .startTime(r.getStartTime())
                                    .endTime(r.getEndTime())
                                    .customPrice(r.getCustomPrice())
                                    .dayOfWeek(r.getDayOfWeek())
                                    .percentageModifier(r.getPercentageModifier())
                                    .fixedModifier(r.getFixedModifier())
                                    .build())
                            .collect(Collectors.toList());
                    return CourtPublicResponse.builder()
                            .id(court.getId())
                            .name(court.getName())
                            .price(court.getPrice())
                            .status(court.getStatus())
                            .priceRules(ruleResponses)
                            .build();
                })
                .collect(Collectors.toList());

        List<String> detailImages = venue.getImages() != null
                ? venue.getImages().stream().map(img -> img.getImageUrl()).collect(Collectors.toList())
                : new ArrayList<>();

        String ownerPhone = (venue.getOwner() != null) ? venue.getOwner().getPhoneNumber() : null;

        String finalCoverImage = venue.getCoverImage();
        if (finalCoverImage == null && venue.getRegistrationImages() != null
                && !venue.getRegistrationImages().trim().isEmpty()) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                java.util.List<String> imageUrls = mapper.readValue(venue.getRegistrationImages(),
                        mapper.getTypeFactory().constructCollectionType(java.util.List.class, String.class));
                if (!imageUrls.isEmpty()) {
                    finalCoverImage = imageUrls.get(0);
                    if (detailImages.isEmpty()) {
                        detailImages = imageUrls;
                    }
                }
            } catch (Exception e) {
            }
        }

        return VenueDetailResponse.builder()
                .id(venue.getId())
                .name(venue.getName())
                .location(venue.getLocation())
                .latitude(venue.getLatitude())
                .longitude(venue.getLongitude())
                .description(venue.getDescription())
                .openingTime(venue.getOpeningTime())
                .closingTime(venue.getClosingTime())
                .shiftDurationMinutes(venue.getShiftDurationMinutes())
                .coverImage(finalCoverImage)
                .detailImages(detailImages)
                .hasSurcharge(venue.getHasSurcharge())
                .surchargeAmount(venue.getSurchargeAmount())
                .surchargeDescription(venue.getSurchargeDescription())
                .status(venue.getStatus())
                .approvalStatus(venue.getApprovalStatus())
                .minPrice(venue.getMinPrice())
                .maxPrice(venue.getMaxPrice())
                .sportName(venue.getSport() != null ? venue.getSport().getName() : venue.getSportTypes())
                .ownerPhone(ownerPhone)
                .courts(courtPublicList)
                .averageRating(venue.getAverageRating())
                .totalReviews(venue.getTotalReviews())
                .build();
    }

    /**
     * Tạo lưới slot cho toàn bộ courts của venue theo ngày cụ thể.
     * Tính giá theo CourtPriceRule (SHIFT > DAY_OF_WEEK > base price).
     * Đánh dấu slot đã bị đặt (CONFIRMED/PENDING booking) hoặc đã qua giờ.
     */
    public List<SlotResponse> getVenueSchedule(UUID venueId, LocalDate date) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new CustomException("Không tìm thấy cụm sân", 404));

        List<Court> courts = courtRepository.findByVenueId(venueId).stream()
                .filter(c -> c.getStatus() == CourtStatus.ACTIVE)
                .collect(Collectors.toList());

        int shiftMinutes = venue.getShiftDurationMinutes() != null ? venue.getShiftDurationMinutes() : 30;
        LocalTime open = venue.getOpeningTime();
        LocalTime close = venue.getClosingTime();
        LocalTime now = LocalTime.now();
        boolean isToday = date.equals(LocalDate.now());

        // Java DayOfWeek: MONDAY=1 ... SUNDAY=7
        int dayOfWeekValue = date.getDayOfWeek().getValue();

        List<TicketSession> ticketSessions = ticketSessionRepository.findByVenueIdAndPlayDate(venueId, date).stream()
                .filter(ts -> ts.getStatus() != com.backend.sporta.enums.TicketSessionStatus.CANCELLED)
                .collect(Collectors.toList());
        List<SlotResponse> result = new ArrayList<>();

        for (Court court : courts) {
            List<CourtPriceRule> rules = courtPriceRuleRepository.findByCourtId(court.getId());

            // Lấy danh sách booking đã xác nhận trong ngày
            java.util.List<com.backend.sporta.entity.BookingDetail> bookedSlots = bookingDetailRepository
                    .findByCourtIdAndBookingDateAndBookingStatusIn(
                            court.getId(), date,
                            Arrays.asList(BookingStatus.CONFIRMED, BookingStatus.PENDING));

            LocalTime slotTime = open;
            while (slotTime.isBefore(close)) {
                final LocalTime currentSlot = slotTime;
                String timeStr = String.format("%02d:%02d", currentSlot.getHour(), currentSlot.getMinute());
                String status;
                UUID bookingId = null;
                Boolean isManual = null;
                UUID ticketSessionId = null;
                Integer bookedSlotsCount = null;
                Integer maxSlotsCount = null;
                String sportLevel = null;
                Double pricePerTicket = null;
                String customerName = null;
                String customerPhone = null;

                // Kiểm tra xem slot có thuộc ca xé vé không
                TicketSession matchedSession = null;
                for (TicketSession ts : ticketSessions) {
                    if (ts.getCourt().getId().equals(court.getId())
                            && !currentSlot.isBefore(ts.getStartTime())
                            && currentSlot.isBefore(ts.getEndTime())) {
                        matchedSession = ts;
                        break;
                    }
                }

                boolean isBooked = bookedSlots.stream()
                        .anyMatch(b -> b.getStartTime().equals(currentSlot));

                if (matchedSession != null) {
                    status = "matchmaking";
                    ticketSessionId = matchedSession.getId();
                    bookedSlotsCount = matchedSession.getBookedSlots();
                    maxSlotsCount = matchedSession.getMaxSlots();
                    sportLevel = matchedSession.getSportLevel().name();
                    pricePerTicket = matchedSession.getPricePerTicket().doubleValue();
                    customerName = "Ca xé vé";
                } else if (isBooked) {
                    status = "booked";
                    com.backend.sporta.entity.BookingDetail bd = bookedSlots.stream()
                            .filter(b -> b.getStartTime().equals(currentSlot))
                            .findFirst().orElse(null);
                    if (bd != null && bd.getBooking() != null) {
                        bookingId = bd.getBooking().getId();
                        isManual = bd.getBooking().getIsManual();
                        if (bd.getBooking().getStatus() == com.backend.sporta.enums.BookingStatus.PENDING) {
                            status = "pending";
                        }
                        if (bd.getBooking().getIsManual() != null && bd.getBooking().getIsManual()) {
                            customerName = bd.getBooking().getCustomerName();
                            customerPhone = bd.getBooking().getCustomerPhone();
                            if (customerName == null || customerName.isEmpty()) {
                                customerName = "Đặt thủ công";
                            }
                        } else if (bd.getBooking().getUser() != null) {
                            customerName = bd.getBooking().getUser().getFullName();
                            customerPhone = bd.getBooking().getUser().getPhoneNumber();
                        } else {
                            customerName = "Khách vãng lai";
                        }
                    }
                } else if (isToday && !currentSlot.isAfter(now)) {
                    status = "locked";
                } else {
                    status = "available";
                }

                // Tính giá phân tầng theo CourtPriceRule qua Helper dùng chung
                double price = com.backend.sporta.util.CourtPricingCalculationHelper.calculateSlotPrice(
                        court.getPrice(), rules, dayOfWeekValue, currentSlot);

                result.add(SlotResponse.builder()
                        .courtId(court.getId())
                        .courtName(court.getName())
                        .time(timeStr)
                        .status(status)
                        .price(price)
                        .bookingId(bookingId)
                        .isManual(isManual)
                        .ticketSessionId(ticketSessionId)
                        .bookedSlots(bookedSlotsCount)
                        .maxSlots(maxSlotsCount)
                        .sportLevel(sportLevel)
                        .pricePerTicket(pricePerTicket)
                        .customerName(customerName)
                        .customerPhone(customerPhone)
                        .build());

                slotTime = slotTime.plusMinutes(shiftMinutes);
            }
        }

        return result;
    }

    @Transactional
    public VenueResponse createVenue(VenueRequest request, String email) {
        Owner owner = ownerRepository.findByUserEmail(email)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin chủ sở hữu", 404));

        Sport sport = null;
        if (request.getSportId() != null) {
            sport = sportRepository.findById(request.getSportId())
                    .orElseThrow(() -> new CustomException("Môn thể thao không tồn tại", 404));
        }

        int duration = request.getShiftDurationMinutes() != null ? request.getShiftDurationMinutes() : 30;
        validateShiftDuration(request.getOpeningTime(), request.getClosingTime(), duration);

        Venue venue = Venue.builder()
                .owner(owner)
                .name(request.getName())
                .location(reconstructLocation(request.getAddressDetail(), request.getWard(), request.getDistrict(),
                        request.getProvince(), request.getLocation()))
                .province(request.getProvince())
                .district(request.getDistrict())
                .ward(request.getWard())
                .addressDetail(request.getAddressDetail())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .description(request.getDescription())
                .openingTime(request.getOpeningTime()) // Dùng LocalTime
                .closingTime(request.getClosingTime())
                .shiftDurationMinutes(duration)
                .sport(sport)
                .coverImage(request.getCoverImage())
                .hasSurcharge(request.getHasSurcharge() != null ? request.getHasSurcharge() : false)
                .surchargeAmount(request.getSurchargeAmount())
                .surchargeDescription(request.getSurchargeDescription())
                .status(VenueStatus.ACTIVE)
                .approvalStatus(ApprovalStatus.APPROVED)
                .build();

        venue = venueRepository.save(venue);

        if (request.getDetailImages() != null && !request.getDetailImages().isEmpty()) {
            List<VenueImage> detailImages = new ArrayList<>();
            for (String imgUrl : request.getDetailImages()) {
                detailImages.add(VenueImage.builder()
                        .venue(venue)
                        .imageUrl(imgUrl)
                        .build());
            }
            venueImageRepository.saveAll(detailImages);
            venue.setImages(detailImages);

            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                venue.setRegistrationImages(mapper.writeValueAsString(request.getDetailImages()));
            } catch (Exception e) {
            }
        }

        return mapToResponse(venue, false);
    }

    @Transactional
    public VenueResponse updateVenueStatus(UUID id, VenueStatus status, String email) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin cụm sân", 404));

        if (venue.getOwner() == null || venue.getOwner().getUser() == null ||
                !venue.getOwner().getUser().getEmail().equals(email)) {
            throw new CustomException("Bạn không có quyền chỉnh sửa cụm sân này", 403);
        }

        venue.setStatus(status);
        return mapToResponse(venueRepository.save(venue), checkHasPendingRevision(venue.getId()));
    }

    @Transactional
    public VenueResponse updateVenue(UUID id, VenueRequest request, String email) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin cụm sân", 404));

        if (venue.getOwner() == null || venue.getOwner().getUser() == null ||
                !venue.getOwner().getUser().getEmail().equals(email)) {
            throw new CustomException("Bạn không có quyền chỉnh sửa cụm sân này", 403);
        }

        if (venue.getApprovalStatus() == com.backend.sporta.enums.ApprovalStatus.PENDING) {
            throw new CustomException("Không thể chỉnh sửa cụm sân đang trong trạng thái chờ duyệt", 400);
        }

        int duration = request.getShiftDurationMinutes() != null ? request.getShiftDurationMinutes() : 30;
        validateShiftDuration(request.getOpeningTime(), request.getClosingTime(), duration);

        String newLocation = reconstructLocation(request.getAddressDetail(), request.getWard(), request.getDistrict(),
                request.getProvince(), request.getLocation());

        boolean hasSensitiveChanges = false;

        // KIỂM TRA THAY ĐỔI NHẠY CẢM để tạo bản nháp (Tên hoặc Địa chỉ/Vị trí)
        if (!venue.getName().equals(request.getName()) || !venue.getLocation().equals(newLocation)) {
            hasSensitiveChanges = true;
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                com.backend.sporta.dto.VenueRevisionData revisionData = com.backend.sporta.dto.VenueRevisionData
                        .builder()
                        .name(request.getName())
                        .location(newLocation)
                        .province(request.getProvince())
                        .district(request.getDistrict())
                        .ward(request.getWard())
                        .addressDetail(request.getAddressDetail())
                        .latitude(request.getLatitude())
                        .longitude(request.getLongitude())
                        .build();

                String pendingData = mapper.writeValueAsString(revisionData);

                // Nếu đã có bản nháp đang chờ duyệt, hủy nó đi (Ghi đè bằng yêu cầu mới)
                java.util.List<VenueRevision> existingRevisions = venueRevisionRepository
                        .findByVenueIdAndStatusOrderByCreatedAtDesc(venue.getId(), ApprovalStatus.PENDING);
                for (VenueRevision rev : existingRevisions) {
                    rev.setStatus(ApprovalStatus.REJECTED);
                    rev.setReviewerNotes("Bị thay thế bởi yêu cầu cập nhật mới.");
                    venueRevisionRepository.save(rev);
                }

                VenueRevision revision = VenueRevision.builder()
                        .venue(venue)
                        .pendingData(pendingData)
                        .status(ApprovalStatus.PENDING)
                        .build();
                venueRevisionRepository.save(revision);
            } catch (Exception e) {
                throw new CustomException("Lỗi xử lý dữ liệu bản nháp", 500);
            }
        }

        // Nếu KHÔNG có thay đổi nhạy cảm HOẶC chúng ta chỉ cập nhật các trường không
        // nhạy cảm
        if (!hasSensitiveChanges) {
            venue.setName(request.getName());
            venue.setLocation(newLocation);
            venue.setProvince(request.getProvince());
            venue.setDistrict(request.getDistrict());
            venue.setWard(request.getWard());
            venue.setAddressDetail(request.getAddressDetail());
            venue.setLatitude(request.getLatitude());
            venue.setLongitude(request.getLongitude());
        }

        // Cập nhật các trường không nhạy cảm (luôn cập nhật ngay lập tức)
        Sport sport = null;
        if (request.getSportId() != null) {
            sport = sportRepository.findById(request.getSportId())
                    .orElseThrow(() -> new CustomException("Môn thể thao không tồn tại", 404));
            venue.setSport(sport);
        }

        venue.setDescription(request.getDescription());
        venue.setOpeningTime(request.getOpeningTime());
        venue.setClosingTime(request.getClosingTime());
        venue.setShiftDurationMinutes(duration);
        venue.setCoverImage(request.getCoverImage());
        venue.setHasSurcharge(request.getHasSurcharge() != null ? request.getHasSurcharge() : false);
        venue.setSurchargeAmount(request.getSurchargeAmount());
        venue.setSurchargeDescription(request.getSurchargeDescription());

        venue.getImages().clear();
        venueRepository.saveAndFlush(venue);

        if (request.getDetailImages() != null && !request.getDetailImages().isEmpty()) {
            List<VenueImage> detailImages = new ArrayList<>();
            for (String imgUrl : request.getDetailImages()) {
                detailImages.add(VenueImage.builder()
                        .venue(venue)
                        .imageUrl(imgUrl)
                        .build());
            }
            venueImageRepository.saveAll(detailImages);
            venue.getImages().addAll(detailImages);

            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                venue.setRegistrationImages(mapper.writeValueAsString(request.getDetailImages()));
            } catch (Exception e) {
            }
        }

        Venue updatedVenue = venueRepository.save(venue);
        return mapToResponse(updatedVenue, hasSensitiveChanges || checkHasPendingRevision(updatedVenue.getId()));
    }

    // Logic tính toán mới sử dụng LocalTime
    private void validateShiftDuration(LocalTime open, LocalTime close, Integer shiftDurationMinutes) {
        if (open == null || close == null || shiftDurationMinutes == null || shiftDurationMinutes <= 0) {
            return;
        }

        int openMin = open.getHour() * 60 + open.getMinute();
        int closeMin = close.getHour() * 60 + close.getMinute();

        int totalMinutes = closeMin - openMin;
        if (totalMinutes <= 0) {
            totalMinutes += 24 * 60; // Mở qua đêm
        }

        if (totalMinutes % shiftDurationMinutes != 0) {
            throw new CustomException(
                    "Khoảng thời gian hoạt động phải chia hết cho thời lượng ca (" + shiftDurationMinutes + " phút)",
                    400);
        }
    }

    @Transactional
    public void updateVenuePriceRange(UUID venueId) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin cụm sân", 404));
        Double minPrice = courtRepository.findMinPriceByVenueIdAndStatusActive(venueId);
        Double maxPrice = courtRepository.findMaxPriceByVenueIdAndStatusActive(venueId);

        int courtCount = courtRepository.findByVenueId(venueId).size();

        venue.setMinPrice(minPrice != null ? minPrice : 0.0);
        venue.setMaxPrice(maxPrice != null ? maxPrice : 0.0);
        venue.setSubCourtCount(courtCount);
        venueRepository.save(venue);
    }

    @Transactional
    public VenueResponse createVenueDraft(VenueDraftRequest request, String email) {
        Owner owner = ownerRepository.findByUserEmail(email)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin chủ sở hữu", 404));

        Sport sport = null;
        if (request.getSportId() != null) {
            sport = sportRepository.findById(request.getSportId()).orElse(null);
        }

        String name = request.getName();
        if (name == null || name.trim().isEmpty()) {
            name = "Cụm sân chưa đặt tên";
        }

        java.time.LocalTime opening = request.getOpeningTime() != null ? request.getOpeningTime()
                : java.time.LocalTime.of(6, 0);
        java.time.LocalTime closing = request.getClosingTime() != null ? request.getClosingTime()
                : java.time.LocalTime.of(22, 0);
        int shiftDuration = request.getShiftDurationMinutes() != null ? request.getShiftDurationMinutes() : 60;

        String newLocation = reconstructLocation(request.getAddressDetail(), request.getWard(), request.getDistrict(),
                request.getProvince(), request.getLocation());

        Venue venue = Venue.builder()
                .owner(owner)
                .name(name)
                .location(newLocation)
                .province(request.getProvince())
                .district(request.getDistrict())
                .ward(request.getWard())
                .addressDetail(request.getAddressDetail())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .description(request.getDescription())
                .openingTime(opening)
                .closingTime(closing)
                .shiftDurationMinutes(shiftDuration)
                .sport(sport)
                .coverImage(request.getCoverImage())
                .hasSurcharge(request.getHasSurcharge() != null ? request.getHasSurcharge() : false)
                .surchargeAmount(request.getSurchargeAmount())
                .surchargeDescription(request.getSurchargeDescription())
                .status(VenueStatus.PENDING_APPROVAL)
                .approvalStatus(ApprovalStatus.DRAFT)
                .subCourtCount(request.getCourts() != null ? request.getCourts().size() : 0)
                .build();

        venue = venueRepository.save(venue);

        VenuePolicy venuePolicy = VenuePolicy.builder()
                .venue(venue)
                .freeCancellationHours(
                        request.getFreeCancellationHours() != null ? request.getFreeCancellationHours() : 12)
                .lateCancellationRefundRate(
                        request.getLateCancellationRefundRate() != null ? request.getLateCancellationRefundRate() : 70)
                .rainRescheduleAllowed(
                        request.getRainRescheduleAllowed() != null ? request.getRainRescheduleAllowed() : true)
                .build();
        venue.setVenuePolicy(venuePolicy);
        venue = venueRepository.save(venue);

        if (request.getIsContractSigned() != null && request.getIsContractSigned()) {
            String contractCode = "SPOR-CTR-" + java.time.Year.now().getValue() + "-"
                    + venue.getId().toString().substring(0, 8).toUpperCase();

            OwnerContract contract = OwnerContract.builder()
                    .owner(owner)
                    .venue(venue)
                    .contractCode(contractCode)
                    .signedIpAddress(request.getSignatureIp() != null ? request.getSignatureIp() : "Unknown")
                    .signedAt(request.getSignatureTimestamp() != null
                            ? java.time.LocalDateTime.parse(request.getSignatureTimestamp().replace("Z", ""))
                            : java.time.LocalDateTime.now())
                    .status(com.backend.sporta.enums.ContractStatus.ACTIVE)
                    .build();

            try {
                String rawData = contractCode + venue.getId() + contract.getSignedAt().toString();
                java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
                byte[] hash = digest.digest(rawData.getBytes(java.nio.charset.StandardCharsets.UTF_8));
                StringBuilder hexString = new StringBuilder(2 * hash.length);
                for (byte b : hash) {
                    String hex = Integer.toHexString(0xff & b);
                    if (hex.length() == 1)
                        hexString.append('0');
                    hexString.append(hex);
                }
                contract.setDigitalSignatureHash(hexString.toString());
            } catch (Exception e) {
                contract.setDigitalSignatureHash("HASH_ERROR");
            }
            ownerContractRepository.save(contract);
        }

        if (request.getDetailImages() != null && !request.getDetailImages().isEmpty()) {
            List<VenueImage> detailImages = new java.util.ArrayList<>();
            for (String imgUrl : request.getDetailImages()) {
                detailImages.add(VenueImage.builder()
                        .venue(venue)
                        .imageUrl(imgUrl)
                        .build());
            }
            venueImageRepository.saveAll(detailImages);
            venue.setImages(detailImages);

            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                venue.setRegistrationImages(mapper.writeValueAsString(request.getDetailImages()));
            } catch (Exception e) {
            }
        }

        syncCourts(venue, request.getCourts(), email);

        return mapToResponse(venue, false);
    }

    @Transactional
    public VenueResponse updateVenueDraft(UUID id, VenueDraftRequest request, String email) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin cụm sân", 404));

        if (venue.getOwner() == null || venue.getOwner().getUser() == null ||
                !venue.getOwner().getUser().getEmail().equals(email)) {
            throw new CustomException("Bạn không có quyền chỉnh sửa cụm sân này", 403);
        }

        if (venue.getApprovalStatus() == com.backend.sporta.enums.ApprovalStatus.PENDING) {
            throw new CustomException("Không thể chỉnh sửa cụm sân đang trong trạng thái chờ duyệt", 400);
        }

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            venue.setName(request.getName());
        }

        String newLocation = reconstructLocation(request.getAddressDetail(), request.getWard(), request.getDistrict(),
                request.getProvince(), request.getLocation());
        venue.setLocation(newLocation);
        venue.setProvince(request.getProvince());
        venue.setDistrict(request.getDistrict());
        venue.setWard(request.getWard());
        venue.setAddressDetail(request.getAddressDetail());
        venue.setLatitude(request.getLatitude());
        venue.setLongitude(request.getLongitude());
        venue.setDescription(request.getDescription());

        if (request.getOpeningTime() != null)
            venue.setOpeningTime(request.getOpeningTime());
        if (request.getClosingTime() != null)
            venue.setClosingTime(request.getClosingTime());
        if (request.getShiftDurationMinutes() != null)
            venue.setShiftDurationMinutes(request.getShiftDurationMinutes());

        if (request.getSportId() != null) {
            Sport sport = sportRepository.findById(request.getSportId())
                    .orElseThrow(() -> new CustomException("Môn thể thao không tồn tại", 404));
            venue.setSport(sport);
        }

        venue.setCoverImage(request.getCoverImage());
        venue.setHasSurcharge(request.getHasSurcharge() != null ? request.getHasSurcharge() : false);
        venue.setSurchargeAmount(request.getSurchargeAmount());
        venue.setSurchargeDescription(request.getSurchargeDescription());
        venue.setSubCourtCount(request.getCourts() != null ? request.getCourts().size() : venue.getSubCourtCount());

        venue.getImages().clear();

        if (venue.getVenuePolicy() == null) {
            venue.setVenuePolicy(VenuePolicy.builder().venue(venue).build());
        }
        if (request.getFreeCancellationHours() != null)
            venue.getVenuePolicy().setFreeCancellationHours(request.getFreeCancellationHours());
        if (request.getLateCancellationRefundRate() != null)
            venue.getVenuePolicy().setLateCancellationRefundRate(request.getLateCancellationRefundRate());
        if (request.getRainRescheduleAllowed() != null)
            venue.getVenuePolicy().setRainRescheduleAllowed(request.getRainRescheduleAllowed());

        if (request.getIsContractSigned() != null && request.getIsContractSigned()) {
            boolean hasContract = ownerContractRepository.existsByVenueId(venue.getId());
            if (!hasContract) {
                String contractCode = "SPOR-CTR-" + java.time.Year.now().getValue() + "-"
                        + venue.getId().toString().substring(0, 8).toUpperCase();
                OwnerContract contract = OwnerContract.builder()
                        .owner(venue.getOwner())
                        .venue(venue)
                        .contractCode(contractCode)
                        .signedIpAddress(request.getSignatureIp() != null ? request.getSignatureIp() : "Unknown")
                        .signedAt(request.getSignatureTimestamp() != null
                                ? java.time.LocalDateTime.parse(request.getSignatureTimestamp().replace("Z", ""))
                                : java.time.LocalDateTime.now())
                        .status(com.backend.sporta.enums.ContractStatus.ACTIVE)
                        .build();
                try {
                    String rawData = contractCode + venue.getId() + contract.getSignedAt().toString();
                    java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
                    byte[] hash = digest.digest(rawData.getBytes(java.nio.charset.StandardCharsets.UTF_8));
                    StringBuilder hexString = new StringBuilder(2 * hash.length);
                    for (byte b : hash) {
                        String hex = Integer.toHexString(0xff & b);
                        if (hex.length() == 1)
                            hexString.append('0');
                        hexString.append(hex);
                    }
                    contract.setDigitalSignatureHash(hexString.toString());
                } catch (Exception e) {
                    contract.setDigitalSignatureHash("HASH_ERROR");
                }
                ownerContractRepository.save(contract);
            }
        }

        venueRepository.saveAndFlush(venue);

        if (request.getDetailImages() != null && !request.getDetailImages().isEmpty()) {
            List<VenueImage> detailImages = new java.util.ArrayList<>();
            for (String imgUrl : request.getDetailImages()) {
                detailImages.add(VenueImage.builder()
                        .venue(venue)
                        .imageUrl(imgUrl)
                        .build());
            }
            venueImageRepository.saveAll(detailImages);
            venue.getImages().addAll(detailImages);

            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                venue.setRegistrationImages(mapper.writeValueAsString(request.getDetailImages()));
            } catch (Exception e) {
            }
        }

        syncCourts(venue, request.getCourts(), email);

        Venue updatedVenue = venueRepository.save(venue);
        return mapToResponse(updatedVenue, false);
    }

    @Transactional
    public VenueResponse submitVenue(UUID id, String email) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin cụm sân", 404));

        if (venue.getOwner() == null || venue.getOwner().getUser() == null ||
                !venue.getOwner().getUser().getEmail().equals(email)) {
            throw new CustomException("Bạn không có quyền thao tác cụm sân này", 403);
        }

        if (venue.getName() == null || venue.getName().trim().isEmpty()
                || venue.getName().equals("Cụm sân chưa đặt tên")) {
            throw new CustomException("Vui lòng nhập tên cụm sân hợp lệ", 400);
        }

        if (venue.getLocation() == null || venue.getLocation().trim().isEmpty()) {
            throw new CustomException("Vui lòng nhập vị trí cụm sân", 400);
        }

        if (venue.getLatitude() == null || venue.getLongitude() == null) {
            throw new CustomException("Vui lòng chọn vị trí trên bản đồ", 400);
        }

        if (venue.getSport() == null) {
            throw new CustomException("Vui lòng chọn môn thể thao", 400);
        }

        validateShiftDuration(venue.getOpeningTime(), venue.getClosingTime(), venue.getShiftDurationMinutes());

        List<Court> courts = courtRepository.findByVenueId(venue.getId());
        if (courts == null || courts.isEmpty()) {
            throw new CustomException("Cụm sân phải có ít nhất một sân hoạt động để gửi duyệt", 400);
        }

        venue.setApprovalStatus(ApprovalStatus.PENDING);
        venue.setStatus(VenueStatus.PENDING_APPROVAL);

        Venue updatedVenue = venueRepository.save(venue);
        return mapToResponse(updatedVenue, false);
    }

    @Transactional
    public VenueResponse cancelSubmitVenue(UUID id, String email) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin cụm sân", 404));

        if (venue.getOwner() == null || venue.getOwner().getUser() == null ||
                !venue.getOwner().getUser().getEmail().equals(email)) {
            throw new CustomException("Bạn không có quyền thao tác cụm sân này", 403);
        }

        if (venue.getApprovalStatus() != com.backend.sporta.enums.ApprovalStatus.PENDING) {
            throw new CustomException("Chỉ có thể hủy yêu cầu duyệt đối với cụm sân đang chờ duyệt", 400);
        }

        venue.setApprovalStatus(com.backend.sporta.enums.ApprovalStatus.DRAFT);

        Venue updatedVenue = venueRepository.save(venue);
        return mapToResponse(updatedVenue, false);
    }

    @Transactional
    public VenueResponse approveVenueTemporary(UUID id, String email) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin cụm sân", 404));

        if (venue.getOwner() == null || venue.getOwner().getUser() == null ||
                !venue.getOwner().getUser().getEmail().equals(email)) {
            throw new CustomException("Bạn không có quyền thao tác cụm sân này", 403);
        }

        if (venue.getApprovalStatus() != com.backend.sporta.enums.ApprovalStatus.PENDING) {
            throw new CustomException("Cụm sân không ở trạng thái chờ duyệt", 400);
        }

        venue.setApprovalStatus(com.backend.sporta.enums.ApprovalStatus.APPROVED);
        venue.setStatus(com.backend.sporta.enums.VenueStatus.ACTIVE);

        Venue updatedVenue = venueRepository.save(venue);
        return mapToResponse(updatedVenue, false);
    }

    private void syncCourts(Venue venue, List<CourtDraftDto> courtsList, String ownerEmail) {
        if (courtsList == null) {
            return;
        }

        List<Court> existingCourts = courtRepository.findByVenueId(venue.getId());

        java.util.Set<UUID> payloadCourtIds = courtsList.stream()
                .map(CourtDraftDto::getId)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toSet());

        List<Court> courtsToDelete = existingCourts.stream()
                .filter(c -> !payloadCourtIds.contains(c.getId()))
                .collect(Collectors.toList());
        if (!courtsToDelete.isEmpty()) {
            courtRepository.deleteAll(courtsToDelete);
        }

        for (CourtDraftDto courtDto : courtsList) {
            Court court;
            if (courtDto.getId() != null) {
                court = courtRepository.findById(courtDto.getId())
                        .orElseThrow(() -> new CustomException("Sân bãi không tồn tại: " + courtDto.getId(), 404));

                if (!court.getVenue().getOwner().getUser().getEmail().equals(ownerEmail)) {
                    throw new CustomException("Bạn không có quyền chỉnh sửa sân bãi này", 403);
                }
                court.setName(courtDto.getName());
                court.setPrice(courtDto.getPrice() != null ? courtDto.getPrice() : 0.0);
                if (courtDto.getStatus() != null) {
                    court.setStatus(courtDto.getStatus());
                }
            } else {
                court = Court.builder()
                        .name(courtDto.getName())
                        .price(courtDto.getPrice() != null ? courtDto.getPrice() : 0.0)
                        .venue(venue)
                        .status(courtDto.getStatus() != null ? courtDto.getStatus()
                                : com.backend.sporta.enums.CourtStatus.ACTIVE)
                        .build();
            }

            court = courtRepository.save(court);

            syncPriceRules(venue, court, courtDto.getPriceRules());
        }

        updateVenuePriceRange(venue.getId());
    }

    private void syncPriceRules(Venue venue, Court court, List<CourtPriceRuleRequest> ruleRequests) {
        courtPriceRuleRepository.deleteByCourtId(court.getId());

        if (ruleRequests != null && !ruleRequests.isEmpty()) {
            LocalTime open = venue.getOpeningTime();
            LocalTime close = venue.getClosingTime();
            Integer shiftDuration = venue.getShiftDurationMinutes();

            boolean performShiftValidation = open != null && close != null && shiftDuration != null
                    && shiftDuration > 0;
            int openMin = performShiftValidation ? (open.getHour() * 60 + open.getMinute()) : 0;
            int closeMin = performShiftValidation ? (close.getHour() * 60 + close.getMinute()) : 0;

            List<CourtPriceRule> newRules = new java.util.ArrayList<>();
            for (CourtPriceRuleRequest req : ruleRequests) {
                if (req.getRuleType() == com.backend.sporta.enums.PriceRuleType.SHIFT) {
                    LocalTime ruleStart = req.getStartTime();
                    LocalTime ruleEnd = req.getEndTime();

                    if (ruleStart == null || ruleEnd == null) {
                        throw new CustomException("Thời gian bắt đầu và kết thúc ca đặc biệt không được để trống", 400);
                    }

                    if (!ruleStart.isBefore(ruleEnd)) {
                        throw new CustomException("Giờ kết thúc ca đặc biệt phải lớn hơn giờ bắt đầu", 400);
                    }

                    if (performShiftValidation) {
                        int startMin = ruleStart.getHour() * 60 + ruleStart.getMinute();
                        int endMin = ruleEnd.getHour() * 60 + ruleEnd.getMinute();

                        // 1. Within operating hours?
                        if (startMin < openMin || endMin > closeMin) {
                            throw new CustomException(
                                    "Ca đặc biệt " + ruleStart + " - " + ruleEnd
                                            + " nằm ngoài khung giờ mở cửa của cụm sân (" + open + " - " + close + ")",
                                    400);
                        }

                        // 2. Aligned with shift boundaries?
                        if ((startMin - openMin) % shiftDuration != 0 || (endMin - openMin) % shiftDuration != 0) {
                            throw new CustomException("Ca đặc biệt " + ruleStart + " - " + ruleEnd
                                    + " không khớp với mốc chia ca (ca dài " + shiftDuration + " phút từ " + open + ")",
                                    400);
                        }

                        // 3. Overlap check?
                        for (CourtPriceRule existing : newRules) {
                            if (existing.getRuleType() == com.backend.sporta.enums.PriceRuleType.SHIFT) {
                                LocalTime eStart = existing.getStartTime();
                                LocalTime eEnd = existing.getEndTime();
                                if (ruleStart.isBefore(eEnd) && eStart.isBefore(ruleEnd)) {
                                    throw new CustomException("Khung giờ ca đặc biệt " + ruleStart + " - " + ruleEnd
                                            + " bị trùng lặp với một quy tắc đã cấu hình", 400);
                                }
                            }
                        }
                    }
                }

                newRules.add(CourtPriceRule.builder()
                        .court(court)
                        .ruleType(req.getRuleType())
                        .startTime(req.getStartTime())
                        .endTime(req.getEndTime())
                        .customPrice(req.getCustomPrice())
                        .dayOfWeek(req.getDayOfWeek())
                        .percentageModifier(req.getPercentageModifier())
                        .fixedModifier(req.getFixedModifier())
                        .build());
            }
            courtPriceRuleRepository.saveAll(newRules);
        }
    }

    private boolean checkHasPendingRevision(UUID venueId) {
        if (venueRevisionRepository == null)
            return false;
        List<VenueRevision> revisions = venueRevisionRepository.findByVenueIdOrderByCreatedAtDesc(venueId);
        return revisions.stream().anyMatch(r -> r.getStatus() == ApprovalStatus.PENDING);
    }

    // Mapper helper
    private VenueResponse mapToResponse(Venue venue, boolean hasPendingRevision) {
        List<String> detailImageUrls = venue.getImages() != null
                ? venue.getImages().stream().map(VenueImage::getImageUrl).collect(Collectors.toList())
                : new ArrayList<>();

        String finalCoverImage = venue.getCoverImage();
        if (finalCoverImage == null && venue.getRegistrationImages() != null
                && !venue.getRegistrationImages().trim().isEmpty()) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                java.util.List<String> imageUrls = mapper.readValue(venue.getRegistrationImages(),
                        mapper.getTypeFactory().constructCollectionType(java.util.List.class, String.class));
                if (!imageUrls.isEmpty()) {
                    finalCoverImage = imageUrls.get(0);
                }
            } catch (Exception e) {
            }
        }

        return VenueResponse.builder()
                .id(venue.getId())
                .name(venue.getName())
                .location(venue.getLocation())
                .province(venue.getProvince())
                .district(venue.getDistrict())
                .ward(venue.getWard())
                .addressDetail(venue.getAddressDetail())
                .latitude(venue.getLatitude())
                .longitude(venue.getLongitude())
                .description(venue.getDescription())
                .openingTime(venue.getOpeningTime())
                .closingTime(venue.getClosingTime())
                .shiftDurationMinutes(venue.getShiftDurationMinutes())
                .coverImage(finalCoverImage)
                .detailImages(detailImageUrls)
                .hasSurcharge(venue.getHasSurcharge())
                .surchargeAmount(venue.getSurchargeAmount())
                .surchargeDescription(venue.getSurchargeDescription())
                .status(venue.getStatus())
                .approvalStatus(venue.getApprovalStatus())
                .hasPendingRevision(hasPendingRevision)
                .minPrice(venue.getMinPrice())
                .maxPrice(venue.getMaxPrice())
                .sportName(venue.getSport() != null ? venue.getSport().getName() : venue.getSportTypes())
                .averageRating(venue.getAverageRating())
                .totalReviews(venue.getTotalReviews())
                .build();
    }

    private String reconstructLocation(String addressDetail, String ward, String district, String province,
            String fallbackLocation) {
        List<String> parts = new ArrayList<>();
        if (addressDetail != null && !addressDetail.trim().isEmpty())
            parts.add(addressDetail.trim());
        if (ward != null && !ward.trim().isEmpty())
            parts.add(ward.trim());
        if (district != null && !district.trim().isEmpty())
            parts.add(district.trim());
        if (province != null && !province.trim().isEmpty())
            parts.add(province.trim());

        if (parts.isEmpty()) {
            return fallbackLocation;
        }
        return String.join(", ", parts);
    }

    @Transactional
    public void deleteVenueDraft(UUID venueId, String ownerEmail) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new CustomException("Cụm sân không tồn tại: " + venueId, 404));

        if (!venue.getOwner().getUser().getEmail().equals(ownerEmail)) {
            throw new CustomException("Bạn không có quyền xóa cụm sân này", 403);
        }

        if (venue.getApprovalStatus() != ApprovalStatus.DRAFT) {
            throw new CustomException("Chỉ được phép xóa cụm sân ở trạng thái bản nháp", 400);
        }

        // Delete all courts and their price rules
        List<Court> courts = courtRepository.findByVenueId(venueId);
        for (Court court : courts) {
            courtPriceRuleRepository.deleteByCourtId(court.getId());
            courtRepository.delete(court);
        }

        // Delete venue (venue images are cascade deleted via CascadeType.ALL)
        venueRepository.delete(venue);
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<VenueResponse> getPendingNewVenues() {
        return venueRepository.findAll().stream()
                .filter(v -> v.getApprovalStatus() == ApprovalStatus.PENDING)
                .map(venue -> mapToResponse(venue, false))
                .collect(Collectors.toList());
    }

    @Transactional
    public void approveNewVenue(UUID id) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new CustomException("Không tìm thấy cụm sân", 404));

        if (venue.getApprovalStatus() != ApprovalStatus.PENDING) {
            throw new CustomException("Cụm sân không ở trạng thái chờ duyệt", 400);
        }

        venue.setApprovalStatus(ApprovalStatus.APPROVED);
        venue.setStatus(VenueStatus.ACTIVE);
        venueRepository.save(venue);
    }

    @Transactional
    public void rejectNewVenue(UUID id, String reason) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new CustomException("Không tìm thấy cụm sân", 404));

        if (venue.getApprovalStatus() != ApprovalStatus.PENDING) {
            throw new CustomException("Cụm sân không ở trạng thái chờ duyệt", 400);
        }

        venue.setApprovalStatus(ApprovalStatus.REJECTED);
        // Có thể lưu thêm lý do từ chối vào một trường note (nếu VenueEntity có hỗ trợ)
        venueRepository.save(venue);
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<com.backend.sporta.dto.VenueRevisionResponse> getPendingRevisions() {
        return venueRevisionRepository.findByStatusOrderByCreatedAtDesc(ApprovalStatus.PENDING).stream().map(rev -> {
            Venue v = rev.getVenue();
            return com.backend.sporta.dto.VenueRevisionResponse.builder()
                    .id(rev.getId())
                    .venueId(v.getId())
                    .venueName(v.getName())
                    .ownerEmail(
                            v.getOwner() != null && v.getOwner().getUser() != null ? v.getOwner().getUser().getEmail()
                                    : "")
                    .pendingData(rev.getPendingData())
                    .status(rev.getStatus())
                    .createdAt(rev.getCreatedAt())
                    .oldName(v.getName())
                    .oldLocation(v.getLocation())
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public void approveRevision(UUID id) {
        VenueRevision rev = venueRevisionRepository.findById(id)
                .orElseThrow(() -> new CustomException("Không tìm thấy yêu cầu cập nhật", 404));

        if (rev.getStatus() != ApprovalStatus.PENDING) {
            throw new CustomException("Yêu cầu này không ở trạng thái chờ duyệt", 400);
        }

        Venue venue = rev.getVenue();
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.backend.sporta.dto.VenueRevisionData data = mapper.readValue(rev.getPendingData(),
                    com.backend.sporta.dto.VenueRevisionData.class);

            venue.setName(data.getName());
            venue.setLocation(data.getLocation());
            venue.setProvince(data.getProvince());
            venue.setDistrict(data.getDistrict());
            venue.setWard(data.getWard());
            venue.setAddressDetail(data.getAddressDetail());
            venue.setLatitude(data.getLatitude());
            venue.setLongitude(data.getLongitude());

            venueRepository.save(venue);

            rev.setStatus(ApprovalStatus.APPROVED);
            rev.setReviewedAt(java.time.LocalDateTime.now());
            venueRevisionRepository.save(rev);
        } catch (Exception e) {
            throw new CustomException("Lỗi phân tích dữ liệu cập nhật: " + e.getMessage(), 500);
        }
    }

    @Transactional
    public void rejectRevision(UUID id, String reason) {
        VenueRevision rev = venueRevisionRepository.findById(id)
                .orElseThrow(() -> new CustomException("Không tìm thấy yêu cầu cập nhật", 404));

        if (rev.getStatus() != ApprovalStatus.PENDING) {
            throw new CustomException("Yêu cầu này không ở trạng thái chờ duyệt", 400);
        }

        rev.setStatus(ApprovalStatus.REJECTED);
        rev.setReviewedAt(java.time.LocalDateTime.now());
        rev.setReviewerNotes(reason);
        venueRevisionRepository.save(rev);
    }

    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Bán kính trái đất (km)
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                        * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    public List<VenueResponse> searchVenues(VenueSearchCriteriaDTO criteria) {
        Specification<Venue> spec = VenueSpecification.buildSearchSpecification(criteria);
        List<Venue> venues = venueRepository.findAll(spec);

        List<VenueResponse> results = new ArrayList<>();

        for (Venue venue : venues) {
            Double distanceKm = null;
            if (criteria.getUserLat() != null && criteria.getUserLng() != null && venue.getLatitude() != null
                    && venue.getLongitude() != null) {
                distanceKm = calculateHaversineDistance(criteria.getUserLat(), criteria.getUserLng(),
                        venue.getLatitude(), venue.getLongitude());
                if (criteria.getRadiusKm() != null && distanceKm > criteria.getRadiusKm()) {
                    continue;
                }
            }

            Integer availableSlots = null;
            if (criteria.getBookingDate() != null && criteria.getStartTime() != null && criteria.getEndTime() != null) {
                boolean hasAvailable = checkVenueAvailability(venue, criteria.getBookingDate(), criteria.getStartTime(),
                        criteria.getEndTime());
                if (!hasAvailable) {
                    continue;
                }
                availableSlots = 1;
            }

            VenueResponse response = mapToResponse(venue, false);
            response.setDistanceKm(distanceKm);
            response.setAvailableSlotsCount(availableSlots);
            results.add(response);
        }

        if (criteria.getUserLat() != null && criteria.getUserLng() != null) {
            results.sort((v1, v2) -> {
                if (v1.getDistanceKm() == null)
                    return 1;
                if (v2.getDistanceKm() == null)
                    return -1;
                return v1.getDistanceKm().compareTo(v2.getDistanceKm());
            });
        }

        return results;
    }

    private boolean checkVenueAvailability(Venue venue, LocalDate date, LocalTime start, LocalTime end) {
        List<Court> activeCourts = courtRepository.findByVenueId(venue.getId()).stream()
                .filter(c -> c.getStatus() == CourtStatus.ACTIVE)
                .collect(Collectors.toList());

        for (Court court : activeCourts) {
            List<com.backend.sporta.entity.BookingDetail> bookings = bookingDetailRepository
                    .findByCourtIdAndBookingDateAndBookingStatusIn(
                            court.getId(), date,
                            Arrays.asList(BookingStatus.CONFIRMED, BookingStatus.PENDING));

            boolean courtAvailable = true;
            for (com.backend.sporta.entity.BookingDetail bd : bookings) {
                if (start.isBefore(bd.getEndTime()) && end.isAfter(bd.getStartTime())) {
                    courtAvailable = false;
                    break;
                }
            }

            if (courtAvailable) {
                return true;
            }
        }
        return false;
    }
}