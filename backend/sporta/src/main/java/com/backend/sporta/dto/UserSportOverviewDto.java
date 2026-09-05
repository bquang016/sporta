package com.backend.sporta.dto;

import com.backend.sporta.enums.EloStatus;
import com.backend.sporta.enums.SportLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSportOverviewDto {
    private Long sportId;
    private String sportName;
    private String sportIcon;
    private boolean isRegistered;
    private SportLevel level;
    private String levelLabel;
    private Integer eloRating;
    private EloStatus eloStatus;
    private Integer placementMatchesPlayed;
    private Integer totalRankedMatches;
    private Integer totalWins;
    private Integer winRate;
    private LocalDateTime lastMatchAt;
}
