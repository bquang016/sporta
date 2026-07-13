package com.backend.sporta.dto;

import com.backend.sporta.enums.SportLevel;
import com.backend.sporta.enums.TicketSessionStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketSessionResponse {
    private UUID id;
    private UUID venueId;
    private String venueName;
    private UUID courtId;
    private String courtName;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate playDate;
    
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;
    
    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;
    
    private BigDecimal pricePerTicket;
    private Integer maxSlots;
    private Integer bookedSlots;
    private SportLevel sportLevel;
    private TicketSessionStatus status;
}
