package com.backend.sporta.dto;

import com.backend.sporta.enums.BookingStatus;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponse {
    private UUID id;
    private String bookingCode;      // "SP-A3K9-X2"

    private UUID courtId;
    private String courtName;
    private UUID venueId;
    private String venueName;
    private String venueLocation;
    private String venuePhone;       // Số điện thoại chủ sân
    private Long sportId;
    private String sportName;

    private Double totalPrice;
    private Double discountAmount;
    private Double finalPrice;
    
    private java.util.List<BookingDetailResponse> details;
    private String paymentMethod;
    private BookingStatus status;

    private String playerName;
    private String playerEmail;
    private String playerPhone;

    private Double refundAmount;
    private Integer refundRate;
    private String cancellationReason;
    private LocalDateTime cancelledAt;

    private String checkoutUrl;
    private Long orderCode;

    private LocalDateTime createdAt;
}
