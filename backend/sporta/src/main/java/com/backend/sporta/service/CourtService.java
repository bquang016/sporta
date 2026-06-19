package com.backend.sporta.service;

import com.backend.sporta.dto.CourtImageDto;
import com.backend.sporta.dto.CourtRequest;
import com.backend.sporta.dto.CourtResponse;
import com.backend.sporta.entity.Court;
import com.backend.sporta.entity.CourtImage;
import com.backend.sporta.entity.Owner;
import com.backend.sporta.entity.Sport;
import com.backend.sporta.enums.CourtStatus;
import com.backend.sporta.exception.CustomException;
import com.backend.sporta.repository.CourtImageRepository;
import com.backend.sporta.repository.CourtRepository;
import com.backend.sporta.repository.OwnerRepository;
import com.backend.sporta.repository.SportRepository;
import com.backend.sporta.entity.Venue;
import com.backend.sporta.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CourtService {

    @Autowired
    private CourtRepository courtRepository;

    @Autowired
    private CourtImageRepository courtImageRepository;

    @Autowired
    private OwnerRepository ownerRepository;

    @Autowired
    private SportRepository sportRepository;

    @Autowired
    private VenueRepository venueRepository;

    public List<CourtResponse> getCourtsByOwnerEmail(String email) {
        return courtRepository.findByOwnerUserEmail(email).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CourtResponse getCourtByIdAndOwnerEmail(UUID id, String email) {
        Court court = courtRepository.findById(id)
                .orElseThrow(() -> new CustomException("Sân bãi không tồn tại", 404));

        if (!court.getOwner().getUser().getEmail().equals(email)) {
            throw new CustomException("Bạn không có quyền truy cập sân bãi này", 403);
        }

        return mapToResponse(court);
    }

    @Transactional
    public CourtResponse registerCourt(CourtRequest request, String email) {
        Owner owner = ownerRepository.findByUserEmail(email)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin chủ sở hữu", 404));

        Sport sport = sportRepository.findById(request.getSportId())
                .orElseThrow(() -> new CustomException("Môn thể thao không tồn tại: " + request.getSportId(), 404));

        Venue venue = null;
        if (request.getVenueId() != null && !request.getVenueId().trim().isEmpty()) {
            venue = venueRepository.findById(UUID.fromString(request.getVenueId()))
                    .orElseThrow(() -> new CustomException("Cụm sân không tồn tại", 404));
        }

        Court court = Court.builder()
                .owner(owner)
                .name(request.getName())
                .price(request.getPrice())
                .description(request.getDescription())
                .coverImage(request.getCoverImage())
                .openingTime(request.getOpeningTime())
                .closingTime(request.getClosingTime())
                .location(request.getLocation())
                .sport(sport)
                .venue(venue)
                .status(CourtStatus.PENDING) // Default is pending approval
                .build();

        court = courtRepository.save(court);

        if (request.getDetailImages() != null) {
            List<CourtImage> detailImages = new ArrayList<>();
            for (String imgUrl : request.getDetailImages()) {
                detailImages.add(CourtImage.builder()
                        .court(court)
                        .imageUrl(imgUrl)
                        .build());
            }
            courtImageRepository.saveAll(detailImages);
            court.setImages(detailImages);
        }

        return mapToResponse(court);
    }

    @Transactional
    public CourtResponse updateCourt(UUID id, CourtRequest request, String email) {
        Court court = courtRepository.findById(id)
                .orElseThrow(() -> new CustomException("Sân bãi không tồn tại", 404));

        if (!court.getOwner().getUser().getEmail().equals(email)) {
            throw new CustomException("Bạn không có quyền chỉnh sửa sân bãi này", 403);
        }

        Sport sport = sportRepository.findById(request.getSportId())
                .orElseThrow(() -> new CustomException("Môn thể thao không tồn tại: " + request.getSportId(), 404));

        Venue venue = null;
        if (request.getVenueId() != null && !request.getVenueId().trim().isEmpty()) {
            venue = venueRepository.findById(UUID.fromString(request.getVenueId()))
                    .orElseThrow(() -> new CustomException("Cụm sân không tồn tại", 404));
        }

        court.setName(request.getName());
        court.setPrice(request.getPrice());
        court.setDescription(request.getDescription());
        court.setCoverImage(request.getCoverImage());
        court.setOpeningTime(request.getOpeningTime());
        court.setClosingTime(request.getClosingTime());
        court.setLocation(request.getLocation());
        court.setSport(sport);
        court.setVenue(venue);

        if (court.getStatus() == CourtStatus.REJECTED) {
            court.setStatus(CourtStatus.PENDING);
        }

        court.getImages().clear();
        courtRepository.saveAndFlush(court);

        if (request.getDetailImages() != null) {
            List<CourtImage> detailImages = new ArrayList<>();
            for (String imgUrl : request.getDetailImages()) {
                detailImages.add(CourtImage.builder()
                        .court(court)
                        .imageUrl(imgUrl)
                        .build());
            }
            courtImageRepository.saveAll(detailImages);
            court.setImages(detailImages);
        }

        court = courtRepository.save(court);
        return mapToResponse(court);
    }

    @Transactional
    public CourtResponse updateCourtStatus(UUID id, CourtStatus status) {
        Court court = courtRepository.findById(id)
                .orElseThrow(() -> new CustomException("Sân bãi không tồn tại", 404));
        court.setStatus(status);
        court = courtRepository.save(court);
        return mapToResponse(court);
    }

    private CourtResponse mapToResponse(Court court) {
        List<CourtImageDto> images = new ArrayList<>();
        if (court.getImages() != null) {
            images = court.getImages().stream()
                    .map(img -> CourtImageDto.builder()
                            .id(img.getId())
                            .imageUrl(img.getImageUrl())
                            .build())
                    .collect(Collectors.toList());
        }

        return CourtResponse.builder()
                .id(court.getId())
                .ownerId(court.getOwner().getId())
                .ownerName(court.getOwner().getFullName())
                .name(court.getName())
                .price(court.getPrice())
                .description(court.getDescription())
                .coverImage(court.getCoverImage())
                .openingTime(court.getOpeningTime())
                .closingTime(court.getClosingTime())
                .location(court.getLocation())
                .sportId(court.getSport().getId())
                .sportName(court.getSport().getName())
                .venueId(court.getVenue() != null ? court.getVenue().getId() : null)
                .venueName(court.getVenue() != null ? court.getVenue().getName() : null)
                .rejectionReason(court.getRejectionReason())
                .status(court.getStatus())
                .detailImages(images)
                .createdAt(court.getCreatedAt())
                .updatedAt(court.getUpdatedAt())
                .build();
    }
}
