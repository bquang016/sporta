package com.backend.sporta.dto;

import lombok.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PricingAnalyticsSummaryResponse {

    private UUID venueId;
    private String venueName;
    private long totalPendingRecommendations;
    private long totalAppliedRecommendations;
    private long totalRejectedRecommendations;
    private double acceptanceRate; // ví dụ 78.5 (%)

    /** Thời điểm batch phân tích gần nhất */
    private java.time.LocalDateTime lastAnalyzedAt;

    /** Khoảng thời gian áp dụng đề xuất (Thứ 2 - Chủ Nhật tuần hiện tại) */
    private java.time.LocalDate evaluationPeriodStart;
    private java.time.LocalDate evaluationPeriodEnd;

    /** Khoảng thời gian dữ liệu lịch sử được khảo sát */
    private Integer historicalLookbackWeeks; // 6 tuần
    private java.time.LocalDate historicalLookbackStart;
    private java.time.LocalDate historicalLookbackEnd;

    /** Heatmap dữ liệu tỷ lệ lấp đầy: Map<CourtId, Map<DayOfWeek, Map<StartTime, OccupancyRate>>> */
    private List<CourtHeatmapDto> courtHeatmaps;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CourtHeatmapDto {
        private UUID courtId;
        private String courtName;
        private List<SlotHeatmapItem> slots;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SlotHeatmapItem {
        private int dayOfWeek; // 1..7
        private String startTime; // "17:00"
        private String endTime; // "18:00"
        private double occupancyRate; // 0.0 .. 1.0
        private int bookedCount;
        private int activeWeeks;
        private double currentPrice;
        private Double suggestedPrice;
    }
}
