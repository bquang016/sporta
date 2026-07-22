package com.backend.sporta.dto;

import com.backend.sporta.enums.SportLevel;
import com.backend.sporta.enums.TicketStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserTicketResponse {
    private UUID ticketId;
    private UUID sessionId;
    private UUID venueId;
    private String venueName;
    private String venueAddress;
    private String courtName;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate playDate;
    
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;
    
    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;
    
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal totalPrice;
    private SportLevel sportLevel;
    private TicketStatus status;
    
    private String qrCodeToken;
    private String shortCode;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
}
