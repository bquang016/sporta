package com.backend.sporta.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VenueStatisticsResponse {
    private UUID venueId;
    private String venueName;
    private LocalDate fromDate;
    private LocalDate toDate;

    // Chỉ số tổng quan toàn cụm sân
    private Double totalRevenue;        // Tổng doanh thu (VNĐ)
    private Integer totalBookings;      // Tổng số đơn đặt sân
    private Integer totalVenueSlots;    // Tổng slot khả dụng tất cả sân
    private Integer totalBookedSlots;   // Tổng slot đã được đặt
    private Double averageOccupancy;    // Tỉ lệ lấp đầy trung bình toàn cụm (%)

    // Thống kê trạng thái sân
    private Integer activeCourtsCount;
    private Integer maintenanceCourtsCount;
    private Integer totalCourtsCount;

    // Chi tiết từng sân
    private List<CourtStatisticsDto> courtStats;
}
