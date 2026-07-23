package com.backend.sporta.dto.matchmaking;

import com.backend.sporta.enums.MatchFlowType;
import com.backend.sporta.enums.MatchRoomStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class MatchRoomDTO {
    private Long id;
    private Long creatorClubId;
    private String creatorClubName;
    private String creatorClubAvatar;
    private Integer creatorClubCrp;
    private Long creatorUserId;
    private String creatorUserName;

    private Long matchedClubId;
    private String matchedClubName;
    private String matchedClubAvatar;
    private Integer matchedClubCrp;

    private Long sportId;
    private String sportName;
    private String format;
    private Integer minElo;
    private Integer maxElo;
    private String area;
    private Double latitude;
    private Double longitude;
    private Double distanceKm;
    private LocalDateTime expectedStartTime;
    private LocalDateTime expectedEndTime;

    private java.util.UUID bookingId;
    private Long courtId;
    private String courtName;
    private String venueName;
    private BigDecimal priceSharePerTeam;

    private MatchFlowType flowType;
    private BigDecimal depositAmount;
    private LocalDateTime ttlExpiresAt;
    private MatchRoomStatus status;
    private Boolean allowDifferentLevel;
    private String message;
    private LocalDateTime createdAt;
}
