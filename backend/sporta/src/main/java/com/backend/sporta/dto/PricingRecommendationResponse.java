package com.backend.sporta.dto;

import com.backend.sporta.enums.ConfidenceLevel;
import com.backend.sporta.enums.RecommendationStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PricingRecommendationResponse {

    private UUID id;
    private UUID courtId;
    private String courtName;
    private UUID venueId;
    private String venueName;
    private Integer dayOfWeek; // 1..7
    private String dayOfWeekLabel; // "Thứ 2", "Thứ 7", "Chủ Nhật"
    private LocalTime startTime;
    private LocalTime endTime;
    private String timeSlotLabel; // "17:00 - 18:00"

    private Double basePrice;
    private Double dayFactor;
    private Double timeSlotFactor;
    private Double occupancyFactor;
    private Double occupancyRate; // 0.0 .. 1.0 (ví dụ 0.85 = 85%)

    private Double rawPrice;
    private Double suggestedPrice;
    private Double priceDifference; // suggestedPrice - basePrice
    private Double priceChangePercentage; // ví dụ +15.0 (%) hoặc -10.0 (%)

    private String recommendationReason;
    private ConfidenceLevel confidenceLevel;
    private RecommendationStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;

    /** Ngày bắt đầu và kết thúc của tuần áp dụng đề xuất giá */
    private java.time.LocalDate effectiveDateStart;
    private java.time.LocalDate effectiveDateEnd;
}
