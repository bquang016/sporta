package com.backend.sporta.dto.matchmaking;

import com.backend.sporta.enums.MatchFlowType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CreateMatchRoomRequest {
    private Long clubId;
    private Long sportId;
    private String format; // 5v5, 7v7, etc.
    private Integer minElo;
    private Integer maxElo;
    private String area;
    private Double latitude;
    private Double longitude;
    private LocalDateTime expectedStartTime;
    private LocalDateTime expectedEndTime;
    private java.util.UUID bookingId; // Nếu là PAID_100
    private java.util.UUID courtId;   // Nếu là DEPOSIT_HOLD (optional)
    private BigDecimal priceSharePerTeam;
    private MatchFlowType flowType;
    private BigDecimal depositAmount;
    private Boolean allowDifferentLevel;
    private String message;
}
