package com.backend.sporta.dto;

import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SlotResponse {
    private UUID courtId;
    private String courtName;
    private String time;           // "HH:mm" — giờ bắt đầu ca, e.g. "16:30"
    private String status;         // "available" | "booked" | "locked" | "matchmaking"
    private Double price;          // Giá đã tính cuối cùng (sau khi áp priceRules)
    private UUID bookingId;
    private Boolean isManual;
    private UUID ticketSessionId;
    private Integer bookedSlots;
    private Integer maxSlots;
    private String sportLevel;
    private Double pricePerTicket;
    private String customerName;
    private String customerPhone;
}
