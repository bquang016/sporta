package com.backend.sporta.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminSportsAnalyticsResponse {
    private LocalDate fromDate;
    private LocalDate toDate;
    private Double totalPlatformGmv;
    private Double totalPlatformCommission; // 10%

    private List<SportAnalyticsItem> sportsBreakdown;
    private List<RegionAnalyticsItem> regionBreakdown;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SportAnalyticsItem {
        private Long sportId;
        private String sportName;
        private Double totalGmv;
        private Double percentage;
        private Integer bookingCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegionAnalyticsItem {
        private String provinceName;
        private Double totalGmv;
        private Double percentage;
        private Integer venueCount;
    }
}
