package com.backend.sporta.service.matchmaking;

import com.backend.sporta.enums.NormalizedOutcome;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public interface ScoreAdapter {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    class ValidationResult {
        private boolean valid;
        private String errorMessage;
    }

    ValidationResult validate(String hostScore, String guestScore, String rawScoreDetails);

    NormalizedOutcome normalize(String hostScore, String guestScore, String rawScoreDetails);

    double calculateG(String hostScore, String guestScore, String rawScoreDetails);

    String getCanonicalScoreText(String hostScore, String guestScore, String rawScoreDetails);
}
