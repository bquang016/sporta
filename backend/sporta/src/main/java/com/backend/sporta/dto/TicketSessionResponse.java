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
    private String venueAddress;
    private String venueLocation;
    private String coverImage;
    private Double latitude;
    private Double longitude;
    private String sportName;
    
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
    private String hostScore;
    private String guestScore;
    private com.backend.sporta.enums.NormalizedOutcome matchOutcome;
    private Boolean isEloSettled;
    private Boolean isDisputed;
    private Boolean hasHostTeam;
    private String hostTeamName;
    private SportLevel hostTeamLevel;
}
