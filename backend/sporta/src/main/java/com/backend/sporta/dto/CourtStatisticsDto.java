package com.backend.sporta.dto;

import com.backend.sporta.enums.CourtStatus;
import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourtStatisticsDto {
    private UUID courtId;
    private String courtName;
    private CourtStatus courtStatus; // ACTIVE | MAINTENANCE
    private Double price;            // Giá cơ bản của sân
    private Integer totalSlots;      // Tổng số slot khả dụng trong kỳ
    private Integer bookedSlots;     // Số slot đã được đặt (CONFIRMED/COMPLETED)
    private Double occupancyRate;    // % lấp đầy (0 - 100)
    private Double revenue;          // Doanh thu thực tế mang lại
    private Integer bookingCount;    // Số lượng lượt đặt sân
}
