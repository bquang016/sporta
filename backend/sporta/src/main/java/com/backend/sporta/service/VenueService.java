package com.backend.sporta.service;

import com.backend.sporta.enums.VenueStatus;
import com.backend.sporta.dto.VenueRequest;
import com.backend.sporta.entity.Owner;
import com.backend.sporta.entity.Sport;
import com.backend.sporta.entity.Venue;
import com.backend.sporta.entity.VenueImage;
import com.backend.sporta.exception.CustomException;
import com.backend.sporta.repository.OwnerRepository;
import com.backend.sporta.repository.SportRepository;
import com.backend.sporta.repository.VenueImageRepository;
import com.backend.sporta.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.UUID;
import java.util.List;

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

    public List<Venue> getVenuesByOwnerEmail(String email) {
        return venueRepository.findByOwnerUserEmail(email);
    }

    @Transactional
    public Venue createVenue(VenueRequest request, String email) {
        Owner owner = ownerRepository.findByUserEmail(email)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin chủ sở hữu", 404));

        Sport sport = null;
        if (request.getSportId() != null) {
            sport = sportRepository.findById(request.getSportId())
                    .orElseThrow(() -> new CustomException("Môn thể thao không tồn tại: " + request.getSportId(), 404));
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
                .openingTime(request.getOpeningTime())
                .closingTime(request.getClosingTime())
                .shiftDurationMinutes(duration)
                .sport(sport)
                .coverImage(request.getCoverImage())
                .build();

        venue = venueRepository.save(venue);

        if (request.getDetailImages() != null) {
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

        return venueRepository.save(venue);
    }

    @Transactional
    public Venue updateVenueStatus(UUID id, VenueStatus status, String email) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin cụm sân", 404));

        if (venue.getOwner() == null || venue.getOwner().getUser() == null || 
            !venue.getOwner().getUser().getEmail().equals(email)) {
            throw new CustomException("Bạn không có quyền chỉnh sửa cụm sân này", 403);
        }

        venue.setStatus(status);
        return venueRepository.save(venue);
    }

    @Transactional
    public Venue updateVenue(UUID id, VenueRequest request, String email) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin cụm sân", 404));

        if (venue.getOwner() == null || venue.getOwner().getUser() == null || 
            !venue.getOwner().getUser().getEmail().equals(email)) {
            throw new CustomException("Bạn không có quyền chỉnh sửa cụm sân này", 403);
        }

        Sport sport = null;
        if (request.getSportId() != null) {
            sport = sportRepository.findById(request.getSportId())
                    .orElseThrow(() -> new CustomException("Môn thể thao không tồn tại: " + request.getSportId(), 404));
        }

        int duration = request.getShiftDurationMinutes() != null ? request.getShiftDurationMinutes() : 30;
        validateShiftDuration(request.getOpeningTime(), request.getClosingTime(), duration);

        venue.setName(request.getName());
        venue.setLocation(request.getLocation());
        venue.setLatitude(request.getLatitude());
        venue.setLongitude(request.getLongitude());
        venue.setDescription(request.getDescription());
        venue.setOpeningTime(request.getOpeningTime());
        venue.setClosingTime(request.getClosingTime());
        venue.setShiftDurationMinutes(duration);
        venue.setSport(sport);
        venue.setCoverImage(request.getCoverImage());

        venue.getImages().clear();
        venueRepository.saveAndFlush(venue);

        if (request.getDetailImages() != null) {
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

        return venueRepository.save(venue);
    }

    private void validateShiftDuration(String openingTime, String closingTime, Integer shiftDurationMinutes) {
        if (openingTime == null || openingTime.trim().isEmpty() ||
            closingTime == null || closingTime.trim().isEmpty()) {
            return;
        }
        if (shiftDurationMinutes == null || shiftDurationMinutes <= 0) {
            throw new CustomException("Thời lượng ca phải lớn hơn 0", 400);
        }
        
        try {
            String[] openParts = openingTime.split(":");
            String[] closeParts = closingTime.split(":");
            if (openParts.length != 2 || closeParts.length != 2) {
                throw new CustomException("Định dạng giờ mở/đóng cửa không hợp lệ", 400);
            }
            
            int openMin = Integer.parseInt(openParts[0]) * 60 + Integer.parseInt(openParts[1]);
            int closeMin = Integer.parseInt(closeParts[0]) * 60 + Integer.parseInt(closeParts[1]);
            
            int totalMinutes = closeMin - openMin;
            if (totalMinutes <= 0) {
                totalMinutes += 24 * 60;
            }
            
            if (totalMinutes % shiftDurationMinutes != 0) {
                throw new CustomException("Khoảng thời gian hoạt động (" + totalMinutes + " phút) phải chia hết cho thời lượng ca (" + shiftDurationMinutes + " phút)", 400);
            }
        } catch (NumberFormatException e) {
            throw new CustomException("Giờ mở/đóng cửa chứa ký tự không hợp lệ", 400);
        }
    }
}
