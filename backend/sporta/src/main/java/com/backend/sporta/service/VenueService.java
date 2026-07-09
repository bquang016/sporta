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
import com.backend.sporta.repository.OwnerRepository;
import com.backend.sporta.repository.SportRepository;
import com.backend.sporta.repository.VenueImageRepository;
import com.backend.sporta.repository.VenueRepository;
import com.backend.sporta.repository.VenueRevisionRepository;
import com.backend.sporta.repository.CourtRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private BookingDetailRepository bookingDetailRepository;
    

    public List<VenueResponse> getVenuesByOwnerEmail(String email) {
        return venueRepository.findByOwnerUserEmail(email).stream()
                .map(venue -> mapToResponse(venue, false))
                .collect(Collectors.toList());
    }

    public List<VenueResponse> getAllActiveVenues() {
        return venueRepository.findByStatusAndApprovalStatus(VenueStatus.ACTIVE, ApprovalStatus.APPROVED).stream()
                .map(venue -> mapToResponse(venue, false))
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
                .coverImage(venue.getCoverImage())
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

        List<SlotResponse> result = new ArrayList<>();

        for (Court court : courts) {
            List<CourtPriceRule> rules = courtPriceRuleRepository.findByCourtId(court.getId());

            // Lấy danh sách booking đã xác nhận trong ngày
            java.util.List<com.backend.sporta.entity.BookingDetail> bookedSlots = bookingDetailRepository.findByCourtIdAndBookingDateAndBookingStatusIn(
                    court.getId(), date,
                    Arrays.asList(BookingStatus.CONFIRMED, BookingStatus.PENDING));

            LocalTime slotTime = open;
            while (slotTime.isBefore(close)) {
                final LocalTime currentSlot = slotTime;
                String timeStr = String.format("%02d:%02d", currentSlot.getHour(), currentSlot.getMinute());

                // Xác định status
                String status;
                if (isToday && !currentSlot.isAfter(now)) {
                    status = "locked";
                } else {
                    boolean isBooked = bookedSlots.stream()
                            .anyMatch(b -> b.getStartTime().equals(currentSlot));
                    status = isBooked ? "booked" : "available";
                }

                // Tính giá: ưu tiên SHIFT rule trước
                double price = court.getPrice();

                // 1. Áp SHIFT rule (giá tùy chỉnh theo ca giờ)
                boolean shiftApplied = false;
                for (CourtPriceRule rule : rules) {
                    if (rule.getRuleType() == PriceRuleType.SHIFT
                            && rule.getStartTime() != null
                            && rule.getEndTime() != null
                            && rule.getCustomPrice() != null
                            && !currentSlot.isBefore(rule.getStartTime())
                            && currentSlot.isBefore(rule.getEndTime())) {
                        price = rule.getCustomPrice();
                        shiftApplied = true;
                        break;
                    }
                }

                // 2. Áp DAY_OF_WEEK modifier lên trên price hiện tại
                for (CourtPriceRule rule : rules) {
                    if (rule.getRuleType() == PriceRuleType.DAY_OF_WEEK
                            && rule.getDayOfWeek() != null
                            && rule.getDayOfWeek() == dayOfWeekValue) {
                        if (rule.getPercentageModifier() != null) {
                            price = price * rule.getPercentageModifier();
                        }
                        if (rule.getFixedModifier() != null) {
                            price = price + rule.getFixedModifier();
                        }
                        break;
                    }
                }

                // Làm tròn giá về hàng nghìn
                price = Math.round(price / 1000.0) * 1000.0;

                result.add(SlotResponse.builder()
                        .courtId(court.getId())
                        .courtName(court.getName())
                        .time(timeStr)
                        .status(status)
                        .price(price)
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
                .location(request.getLocation())
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
        return mapToResponse(venueRepository.save(venue), false);
    }

    @Transactional
    public VenueResponse updateVenue(UUID id, VenueRequest request, String email) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin cụm sân", 404));

        if (venue.getOwner() == null || venue.getOwner().getUser() == null || 
            !venue.getOwner().getUser().getEmail().equals(email)) {
            throw new CustomException("Bạn không có quyền chỉnh sửa cụm sân này", 403);
        }

        int duration = request.getShiftDurationMinutes() != null ? request.getShiftDurationMinutes() : 30;
        validateShiftDuration(request.getOpeningTime(), request.getClosingTime(), duration);

        boolean hasSensitiveChanges = false;

        // KIỂM TRA THAY ĐỔI NHẠY CẢM để tạo bản nháp
        if (!venue.getName().equals(request.getName()) || !venue.getLocation().equals(request.getLocation())) {
            hasSensitiveChanges = true;
            venue.setApprovalStatus(ApprovalStatus.PENDING);
            try {
                // Thay vì dùng objectMapper, ta dùng luôn .toString() của Java
                String pendingData = request.toString(); 
                
                VenueRevision revision = VenueRevision.builder()
                        .venue(venue)
                        .pendingData(pendingData)
                        .status(ApprovalStatus.PENDING)
                        .build();
                venueRevisionRepository.save(revision);
            } catch (Exception e) {
                throw new CustomException("Lỗi xử lý dữ liệu bản nháp", 500);
            }
        } else {
            venue.setApprovalStatus(ApprovalStatus.APPROVED);
        }

        // Cập nhật các trường không nhạy cảm
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
            venue.setImages(detailImages);
        }

        Venue updatedVenue = venueRepository.save(venue);
        return mapToResponse(updatedVenue, hasSensitiveChanges);
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
            throw new CustomException("Khoảng thời gian hoạt động phải chia hết cho thời lượng ca (" + shiftDurationMinutes + " phút)", 400);
        }
    }

    @Transactional
    public void updateVenuePriceRange(UUID venueId) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin cụm sân", 404));
        Double minPrice = courtRepository.findMinPriceByVenueIdAndStatusActive(venueId);
        Double maxPrice = courtRepository.findMaxPriceByVenueIdAndStatusActive(venueId);
        
        venue.setMinPrice(minPrice != null ? minPrice : 0.0);
        venue.setMaxPrice(maxPrice != null ? maxPrice : 0.0);
        venueRepository.save(venue);
    }

    // Mapper helper
    private VenueResponse mapToResponse(Venue venue, boolean hasPendingRevision) {
        List<String> detailImageUrls = venue.getImages() != null ? 
            venue.getImages().stream().map(VenueImage::getImageUrl).collect(Collectors.toList()) : new ArrayList<>();

        return VenueResponse.builder()
                .id(venue.getId())
                .name(venue.getName())
                .location(venue.getLocation())
                .latitude(venue.getLatitude())
                .longitude(venue.getLongitude())
                .description(venue.getDescription())
                .openingTime(venue.getOpeningTime())
                .closingTime(venue.getClosingTime())
                .shiftDurationMinutes(venue.getShiftDurationMinutes())
                .coverImage(venue.getCoverImage())
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
                .build();
    }
}