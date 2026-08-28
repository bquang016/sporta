package com.backend.sporta.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CancelBookingResponse {
    private Boolean success;
    private UUID bookingId;
    private String bookingCode;
    private String status;
    private Long refundAmount;
    private Integer refundRate;
    private Long cancellationFee;
    private Long userWalletBalance;
    private String message;
    private LocalDateTime cancelledAt;
}
