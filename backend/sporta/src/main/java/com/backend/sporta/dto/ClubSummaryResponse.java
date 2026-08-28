package com.backend.sporta.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClubSummaryResponse {
    private String id;
    private String name;
    private String sportId;
    private String sportName;
    private String logoUrl;
    private Integer activeMemberCount;
    private Boolean isEligibleForMatchmaking;
    private Integer clubElo;
    private String levelLabel;
    private Integer crp;
    private Integer rankingPosition;
}
