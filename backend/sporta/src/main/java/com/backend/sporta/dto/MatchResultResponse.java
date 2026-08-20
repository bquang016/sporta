package com.backend.sporta.dto;

import com.backend.sporta.enums.NormalizedOutcome;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchResultResponse {
    private String matchId;
    private NormalizedOutcome outcome;
    private String finalScoreText;
    private Integer hostCrpBefore;
    private Integer hostCrpDelta;
    private Integer hostCrpAfter;
    private Integer guestCrpBefore;
    private Integer guestCrpDelta;
    private Integer guestCrpAfter;
    private List<String> explanation;
    private String confirmedAt;
}
