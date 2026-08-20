package com.backend.sporta.dto;

import com.backend.sporta.enums.MatchType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RankingPreviewResponse {
    private MatchType matchType;
    private Integer hostClubElo;
    private Integer guestClubElo;
    private String balanceLabel;
    private Double dominanceFactor;
    private Integer upsetModifier;
    private Integer hostCrpBefore;
    private Integer guestCrpBefore;
    private Integer hostCrpDelta;
    private Integer guestCrpDelta;
    private Integer hostCrpAfter;
    private Integer guestCrpAfter;
    private List<String> explanation;
}
