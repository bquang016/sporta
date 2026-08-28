package com.backend.sporta.dto;

import com.backend.sporta.enums.ApprovalStatus;
import com.backend.sporta.enums.VenueStatus;
import lombok.*;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VenueDetailResponse {
    private UUID id;
    private String name;
    private String location;
    private Double latitude;
    private Double longitude;
    private String description;

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

    // Số điện thoại chủ sân (để hiển thị trong header BookingDetail)
    private String ownerPhone;

    // Danh sách sân con kèm giá và priceRules
    private List<CourtPublicResponse> courts;

    // Điểm đánh giá (cache từ bảng venue_reviews)
    private Double averageRating;
    private Integer totalReviews;
}
