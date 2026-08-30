package com.backend.sporta.dto;

import com.backend.sporta.enums.SportLevel;
import com.fasterxml.jackson.annotation.JsonFormat;
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
public class TicketCheckInResponse {
    private UUID ticketId;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String customerAvatar;
    private String venueName;
    private String courtName;
    private String shortCode;
    
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;
    
    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate playDate;

    @JsonFormat(pattern = "HH:mm:ss dd/MM/yyyy")
    private LocalDateTime checkInTime;
    
    private SportLevel sportLevel;
    private Integer quantity;
    private String status; // "USED"
}
