package com.backend.sporta.service.matchmaking;

import com.backend.sporta.enums.NormalizedOutcome;
import org.springframework.stereotype.Component;

@Component
public class SetBasedScoreAdapter implements ScoreAdapter {

    @Override
    public ValidationResult validate(String hostScore, String guestScore, String rawScoreDetails) {
        try {
            int hSets = Integer.parseInt(hostScore.trim());
            int gSets = Integer.parseInt(guestScore.trim());
            if (hSets < 0 || gSets < 0) {
                return new ValidationResult(false, "Số set thắng không được âm");
            }
            if (hSets == gSets) {
                return new ValidationResult(false, "Môn tính set không chấp nhận hòa set");
            }
            return new ValidationResult(true, null);
        } catch (NumberFormatException e) {
            return new ValidationResult(false, "Số set phải là số nguyên hợp lệ");
        }
    }

    @Override
    public NormalizedOutcome normalize(String hostScore, String guestScore, String rawScoreDetails) {
        int hSets = Integer.parseInt(hostScore.trim());
        int gSets = Integer.parseInt(guestScore.trim());
        if (hSets > gSets) {
            return NormalizedOutcome.WIN_HOST;
        } else if (gSets > hSets) {
            return NormalizedOutcome.WIN_GUEST;
        } else {
            return NormalizedOutcome.DRAW;
        }
    }

    @Override
    public double calculateG(String hostScore, String guestScore, String rawScoreDetails) {
        int hSets = Integer.parseInt(hostScore.trim());
        int gSets = Integer.parseInt(guestScore.trim());
        int totalSets = hSets + gSets;
        if (totalSets == 0) {
            return 0.5;
        }
        double rawG = 0.5 + 0.5 * Math.abs(hSets - gSets) / (double) totalSets;
        return Math.max(0.5, Math.min(1.0, rawG));
    }

    @Override
    public String getCanonicalScoreText(String hostScore, String guestScore, String rawScoreDetails) {
        if (rawScoreDetails != null && !rawScoreDetails.isBlank()) {
            return hostScore.trim() + " - " + guestScore.trim() + " (" + rawScoreDetails.trim() + ")";
        }
        return hostScore.trim() + " - " + guestScore.trim() + " set";
    }
}
