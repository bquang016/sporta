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
                .build();
    }
}