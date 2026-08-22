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
    private String type; // "venue", "slot", "booking_draft", "partner"
    private String id; // venue_id hoặc booking_id
    private String name;
    private String image;
    private String subtitle; // ví dụ "18:00 - 20:00"
    private Double price;
    private String actionText; // Nút, ví dụ "Đặt ngay"
}
