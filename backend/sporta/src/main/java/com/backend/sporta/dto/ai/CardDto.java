package com.backend.sporta.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CardDto {
    private String type; // "venue", "slot", "booking_draft", "partner", "club"
    private String id; // venue_id hoặc booking_id
    private String name;
    private String image;
    private String subtitle; // ví dụ "18:00 - 20:00" hoặc địa chỉ
    private Double price;
    private Double rating; // Điểm sao đánh giá (ví dụ 4.9)
    private Integer totalReviews; // Tổng số lượt đánh giá
    private String actionText; // Nút, ví dụ "Xem chi tiết", "Đặt ngay"
}
