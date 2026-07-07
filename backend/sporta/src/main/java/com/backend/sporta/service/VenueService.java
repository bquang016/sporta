package com.backend.sporta.service;

import com.backend.sporta.enums.ApprovalStatus;
import com.backend.sporta.enums.VenueStatus;
import com.backend.sporta.dto.VenueRequest;
import com.backend.sporta.dto.VenueResponse;
import com.backend.sporta.entity.Owner;
import com.backend.sporta.entity.Sport;
import com.backend.sporta.entity.Venue;
import com.backend.sporta.entity.VenueImage;
import com.backend.sporta.entity.VenueRevision;
import com.backend.sporta.exception.CustomException;
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
import com.backend.sporta.repository.CourtPriceRuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.ArrayList;
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
                .location(reconstructLocation(request.getAddressDetail(), request.getWard(), request.getDistrict(), request.getProvince(), request.getLocation()))
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

        String newLocation = reconstructLocation(request.getAddressDetail(), request.getWard(), request.getDistrict(), request.getProvince(), request.getLocation());

        // KIỂM TRA THAY ĐỔI NHẠY CẢM để tạo bản nháp
        if (!venue.getName().equals(request.getName()) || !venue.getLocation().equals(newLocation)) {
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

        venue.setName(request.getName());
        venue.setLocation(newLocation);
        venue.setProvince(request.getProvince());
        venue.setDistrict(request.getDistrict());
        venue.setWard(request.getWard());
        venue.setAddressDetail(request.getAddressDetail());
        venue.setLatitude(request.getLatitude());
        venue.setLongitude(request.getLongitude());

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

        java.time.LocalTime opening = request.getOpeningTime() != null ? request.getOpeningTime() : java.time.LocalTime.of(6, 0);
        java.time.LocalTime closing = request.getClosingTime() != null ? request.getClosingTime() : java.time.LocalTime.of(22, 0);
        int shiftDuration = request.getShiftDurationMinutes() != null ? request.getShiftDurationMinutes() : 60;

        String newLocation = reconstructLocation(request.getAddressDetail(), request.getWard(), request.getDistrict(), request.getProvince(), request.getLocation());

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
                .build();

        venue = venueRepository.save(venue);

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

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            venue.setName(request.getName());
        }
        
        String newLocation = reconstructLocation(request.getAddressDetail(), request.getWard(), request.getDistrict(), request.getProvince(), request.getLocation());
        venue.setLocation(newLocation);
        venue.setProvince(request.getProvince());
        venue.setDistrict(request.getDistrict());
        venue.setWard(request.getWard());
        venue.setAddressDetail(request.getAddressDetail());
        venue.setLatitude(request.getLatitude());
        venue.setLongitude(request.getLongitude());
        venue.setDescription(request.getDescription());
        
        if (request.getOpeningTime() != null) venue.setOpeningTime(request.getOpeningTime());
        if (request.getClosingTime() != null) venue.setClosingTime(request.getClosingTime());
        if (request.getShiftDurationMinutes() != null) venue.setShiftDurationMinutes(request.getShiftDurationMinutes());

        if (request.getSportId() != null) {
            Sport sport = sportRepository.findById(request.getSportId())
                    .orElseThrow(() -> new CustomException("Môn thể thao không tồn tại", 404));
            venue.setSport(sport);
        }
        
        venue.setCoverImage(request.getCoverImage());
        venue.setHasSurcharge(request.getHasSurcharge() != null ? request.getHasSurcharge() : false);
        venue.setSurchargeAmount(request.getSurchargeAmount());
        venue.setSurchargeDescription(request.getSurchargeDescription());

        venue.getImages().clear();
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
            venue.setImages(detailImages);
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

        if (venue.getName() == null || venue.getName().trim().isEmpty() || venue.getName().equals("Cụm sân chưa đặt tên")) {
            throw new CustomException("Vui lòng nhập tên cụm sân hợp lệ", 400);
        }

        if (venue.getLocation() == null || venue.getLocation().trim().isEmpty()) {
            throw new CustomException("Vui lòng nhập vị trí cụm sân", 400);
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
                        .status(courtDto.getStatus() != null ? courtDto.getStatus() : com.backend.sporta.enums.CourtStatus.ACTIVE)
                        .build();
            }

            court = courtRepository.save(court);

            syncPriceRules(court, courtDto.getPriceRules());
        }

        updateVenuePriceRange(venue.getId());
    }

    private void syncPriceRules(Court court, List<CourtPriceRuleRequest> ruleRequests) {
        courtPriceRuleRepository.deleteByCourtId(court.getId());

        if (ruleRequests != null && !ruleRequests.isEmpty()) {
            List<CourtPriceRule> newRules = ruleRequests.stream()
                    .map(req -> CourtPriceRule.builder()
                            .court(court)
                            .ruleType(req.getRuleType())
                            .startTime(req.getStartTime())
                            .endTime(req.getEndTime())
                            .customPrice(req.getCustomPrice())
                            .dayOfWeek(req.getDayOfWeek())
                            .percentageModifier(req.getPercentageModifier())
                            .fixedModifier(req.getFixedModifier())
                            .build())
                    .collect(Collectors.toList());
            courtPriceRuleRepository.saveAll(newRules);
        }
    }

    // Mapper helper
    private VenueResponse mapToResponse(Venue venue, boolean hasPendingRevision) {
        List<String> detailImageUrls = venue.getImages() != null ? 
            venue.getImages().stream().map(VenueImage::getImageUrl).collect(Collectors.toList()) : new ArrayList<>();

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

    private String reconstructLocation(String addressDetail, String ward, String district, String province, String fallbackLocation) {
        List<String> parts = new ArrayList<>();
        if (addressDetail != null && !addressDetail.trim().isEmpty()) parts.add(addressDetail.trim());
        if (ward != null && !ward.trim().isEmpty()) parts.add(ward.trim());
        if (district != null && !district.trim().isEmpty()) parts.add(district.trim());
        if (province != null && !province.trim().isEmpty()) parts.add(province.trim());
        
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
}