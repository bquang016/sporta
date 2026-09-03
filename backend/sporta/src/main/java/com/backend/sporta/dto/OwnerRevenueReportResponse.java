package com.backend.sporta.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerRevenueReportResponse {
    private UUID venueId;
    private String venueName;
    private LocalDate fromDate;
    private LocalDate toDate;

    // Summary KPIs
    private Double totalGmv;
    private Double netRevenue;      // 90% (Thực nhận)
    private Double commissionFee;   // 10% (Phí sàn)
    private Integer totalBookings;
    private Double averageOrderValue;

    // Revenue by Source
    private Double bookingSingleAmount; // Đặt lẻ
    private Double bookingFixedAmount;  // Đặt cố định
    private Double ticketSessionAmount; // Vé lượt (vé xé)

    // Revenue by Payment Method
    private Double payosAmount;
    private Double walletAmount;
    private Double cashAmount;

    // Daily Timeline Data for Charts
    private List<DailyRevenuePoint> dailyTimeline;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyRevenuePoint {
        private String date;
        private Double gmv;
        private Double netRevenue;
        private Integer bookingCount;
    }
}
