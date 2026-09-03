package com.backend.sporta.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardResponse {
    private Integer rank;
    private Long clubId;
    private String clubName;
    private String avatarUrl;
    private Long sportId;
    private String sportName;
    private String area;
    private Integer elo;
    private String levelLabel;
    private Integer crp;
    private Integer rankedWins;
    private Integer finalMatches;
    private Integer winRate;
    private String streak;
    private String tier;
    private Boolean isUserClub;
    private Integer activeMemberCount;
}
