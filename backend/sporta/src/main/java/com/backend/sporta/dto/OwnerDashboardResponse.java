package com.backend.sporta.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerDashboardResponse {

    private List<ComplexDto> listComplexes;
    private DashboardStatsDto stats;
    private List<PitchDto> pitches;
    private List<DashboardBookingDto> bookings;
    private List<ActivityDto> activities;
    private ChartDataDto chartData;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComplexDto {
        private String id;
        private String name;
        private String location;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardStatsDto {
        private double revenue;
        private long revenueK;
        private int occupancy;
        private int pendingCount;
        private String activeRatio;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PitchDto {
        private String id;
        private String name;
        private String type;
        private String complexId;
        private String status; // "available" | "busy" | "maintenance"
        private double price;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardBookingDto {
        private String id;
        private String pitchName;
        private String complexId;
        private String date;
        private String time;
        private String customerName;
        private String phone;
        private double amount;
        private String status; // "pending-checkin" | "checked-in"
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivityDto {
        private String id;
        private String time;
        private String message;
        private String type; // "system" | "check-in" | "status-change"
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChartDataDto {
        private List<String> labels;
        private List<Double> values;
    }
}
