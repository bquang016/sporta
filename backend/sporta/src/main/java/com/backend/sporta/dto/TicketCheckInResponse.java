package com.backend.sporta.dto;

import com.backend.sporta.enums.SportLevel;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import java.time.LocalDate;
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
    private String courtName;
    
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;
    
    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate playDate;
    
    private SportLevel sportLevel;
    private String status; // "USED"
}
