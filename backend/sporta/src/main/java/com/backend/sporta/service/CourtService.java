package com.backend.sporta.service;

import com.backend.sporta.dto.CourtRequest;
import com.backend.sporta.dto.CourtResponse;
import com.backend.sporta.dto.CourtPriceRuleRequest;
import com.backend.sporta.dto.CourtPriceRuleResponse;
import com.backend.sporta.entity.Court;
import com.backend.sporta.entity.CourtPriceRule;
import com.backend.sporta.enums.CourtStatus;
import com.backend.sporta.exception.CustomException;
import com.backend.sporta.repository.CourtRepository;
import com.backend.sporta.repository.CourtPriceRuleRepository;
import com.backend.sporta.entity.Venue;
import com.backend.sporta.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CourtService {

    @Autowired
    private CourtRepository courtRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private CourtPriceRuleRepository courtPriceRuleRepository;

    @Autowired
    private VenueService venueService;

    public List<CourtResponse> getCourtsByOwnerEmail(String email) {
        return courtRepository.findByVenueOwnerUserEmail(email).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CourtResponse getCourtByIdAndOwnerEmail(UUID id, String email) {
        Court court = courtRepository.findById(id)
                .orElseThrow(() -> new CustomException("Sân bãi không tồn tại", 404));

        if (!court.getVenue().getOwner().getUser().getEmail().equals(email)) {
            throw new CustomException("Bạn không có quyền truy cập sân bãi này", 403);
        }

        return mapToResponse(court);
    }

    @Transactional
    public CourtResponse registerCourt(CourtRequest request, String email) {
        Venue venue = venueRepository.findById(UUID.fromString(request.getVenueId()))
                .orElseThrow(() -> new CustomException("Cụm sân không tồn tại", 404));

        if (!venue.getOwner().getUser().getEmail().equals(email)) {
            throw new CustomException("Bạn không có quyền đăng ký sân cho cụm sân này", 403);
        }

        Court court = Court.builder()
                .name(request.getName())
                .price(request.getPrice())
                .venue(venue)
                .status(request.getStatus() != null ? request.getStatus() : CourtStatus.ACTIVE)
                .build();

        court = courtRepository.save(court);
        
        // Trigger đồng bộ khoảng giá cụm sân
        venueService.updateVenuePriceRange(venue.getId());
        
        return mapToResponse(court);
    }

    @Transactional
    public CourtResponse updateCourt(UUID id, CourtRequest request, String email) {
        Court court = courtRepository.findById(id)
                .orElseThrow(() -> new CustomException("Sân bãi không tồn tại", 404));

        if (!court.getVenue().getOwner().getUser().getEmail().equals(email)) {
            throw new CustomException("Bạn không có quyền chỉnh sửa sân bãi này", 403);
        }

        Venue venue = venueRepository.findById(UUID.fromString(request.getVenueId()))
                .orElseThrow(() -> new CustomException("Cụm sân không tồn tại", 404));

        court.setName(request.getName());
        court.setPrice(request.getPrice());
        court.setVenue(venue);
        if (request.getStatus() != null) {
            court.setStatus(request.getStatus());
        }

        court = courtRepository.save(court);
        
        // Trigger đồng bộ khoảng giá cụm sân
        venueService.updateVenuePriceRange(venue.getId());
        
        return mapToResponse(court);
    }

    @Transactional
    public CourtResponse updateCourtStatus(UUID id, CourtStatus status) {
        Court court = courtRepository.findById(id)
                .orElseThrow(() -> new CustomException("Sân bãi không tồn tại", 404));
        court.setStatus(status);
        court = courtRepository.save(court);
        
        // Trigger đồng bộ khoảng giá cụm sân
        venueService.updateVenuePriceRange(court.getVenue().getId());
        
        return mapToResponse(court);
    }

    public List<CourtPriceRuleResponse> getPriceRulesByCourtId(UUID courtId, String ownerEmail) {
        Court court = courtRepository.findById(courtId)
                .orElseThrow(() -> new CustomException("Sân bãi không tồn tại", 404));

        if (!court.getVenue().getOwner().getUser().getEmail().equals(ownerEmail)) {
            throw new CustomException("Bạn không có quyền truy cập sân bãi này", 403);
        }

        return courtPriceRuleRepository.findByCourtId(courtId).stream()
                .map(rule -> CourtPriceRuleResponse.builder()
                        .id(rule.getId())
                        .courtId(rule.getCourt().getId())
                        .ruleType(rule.getRuleType())
                        .startTime(rule.getStartTime())
                        .endTime(rule.getEndTime())
                        .customPrice(rule.getCustomPrice())
                        .dayOfWeek(rule.getDayOfWeek())
                        .percentageModifier(rule.getPercentageModifier())
                        .fixedModifier(rule.getFixedModifier())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void savePriceRules(UUID courtId, List<CourtPriceRuleRequest> requests, String ownerEmail) {
        Court court = courtRepository.findById(courtId)
                .orElseThrow(() -> new CustomException("Sân bãi không tồn tại", 404));

        if (!court.getVenue().getOwner().getUser().getEmail().equals(ownerEmail)) {
            throw new CustomException("Bạn không có quyền cấu hình giá cho sân bãi này", 403);
        }

        // Xóa tất cả các rule cũ của sân này
        courtPriceRuleRepository.deleteByCourtId(courtId);

        if (requests != null && !requests.isEmpty()) {
            List<CourtPriceRule> newRules = requests.stream()
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

    private CourtResponse mapToResponse(Court court) {
        return CourtResponse.builder()
                .id(court.getId())
                .ownerId(court.getVenue().getOwner().getId())
                .ownerName(court.getVenue().getOwner().getFullName())
                .name(court.getName())
                .price(court.getPrice())
                .venueId(court.getVenue().getId())
                .venueName(court.getVenue().getName())
                .status(court.getStatus())
                .createdAt(court.getCreatedAt())
                .updatedAt(court.getUpdatedAt())
                .build();
    }
}
