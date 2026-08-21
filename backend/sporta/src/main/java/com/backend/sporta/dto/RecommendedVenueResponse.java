package com.backend.sporta.dto;

import com.backend.sporta.enums.ApprovalStatus;
import com.backend.sporta.enums.VenueStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendedVenueResponse {

    private UUID id;
    private String name;
    private String location;
    private Double latitude;
    private Double longitude;
    private String description;
    
    private String province;
    private String district;
    private String ward;
    private String addressDetail;
    
    private LocalTime openingTime;
    private LocalTime closingTime;
    private Integer shiftDurationMinutes;
    
    private String coverImage;
    private List<String> detailImages;
    
    private Boolean hasSurcharge;
    private Double surchargeAmount;
    private String surchargeDescription;
    
    private VenueStatus status;
    private ApprovalStatus approvalStatus;
    
    private Double minPrice;
    private Double maxPrice;
    private String sportName;
    private Long sportId;
    
    private Double distanceKm;
    private Integer availableSlotsCount;

    // Recommendation specific attributes
    private Integer matchScore; // 0 - 100
    private String recommendationReason; // e.g. "✨ Môn bạn chơi nhiều nhất"
    private String reasonType; // "SPORT", "DISTANCE", "PRICE", "POPULARITY", "HISTORY"
    private Integer pastBookingCount; // Số lần đã đặt tại sân này
}
