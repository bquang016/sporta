package com.backend.sporta.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {

    private List<AdminKpiDto> metrics;
    private AdminChartDataDto revenueData;
    private AdminChartDataDto userData;
    private List<AdminActivityDto> activities;
    private Map<String, List<PartnerDataDto>> leaderboardData;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminKpiDto {
        private String label;
        private String value;
        private String change;
        @com.fasterxml.jackson.annotation.JsonProperty("isPositive")
        private boolean isPositive;
        private String tooltip;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminChartDataDto {
        private List<String> labels;
        private List<Double> values;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminActivityDto {
        private String id;
        private String time;
        private String message;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PartnerDataDto {
        private String id;
        private String courtName;
        private String ownerName;
        private int successfulBookings;
        private double totalGmv;
        private double commission;
    }
}
