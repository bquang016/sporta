package com.backend.sporta.dto;

import com.backend.sporta.enums.NormalizedOutcome;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScoreSubmissionResponse {
    private String matchId;
    private String hostScore;
    private String guestScore;
    private String rawScoreDetails;
    private String submittedByClubId;
    private String submittedAt;
    private NormalizedOutcome normalizedOutcome;
}
