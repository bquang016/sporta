package com.backend.sporta.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RankedMatchHistoryItemDto {
    private String id;
    private String matchType; // "XE_VE" | "CLUB_RANKED"
    private String sportName;
    private LocalDateTime playedAt;
    private String venueName;
    private String courtName;
    private String hostName;
    private String hostAvatarUrl;
    private String guestName;
    private String guestAvatarUrl;
    private String scoreText;
    private String userSide; // "HOST" | "GUEST"
    private String userOutcome; // "WIN" | "LOSS" | "DRAW"
    private Integer personalEloDelta;
    private Integer eloBefore;
    private Integer eloAfter;
    private Integer clubCrpDelta;
    private Integer crpBefore;
    private Integer crpAfter;
    private List<String> bonusNotes;
    private List<String> explanation;
    private Boolean isCaptain;
    private Boolean isDisputed;
}
