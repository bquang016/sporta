package com.backend.sporta.service.matchmaking;

import com.backend.sporta.config.MatchmakingConfig;
import com.backend.sporta.enums.NormalizedOutcome;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class BasketballScoreAdapter implements ScoreAdapter {

    @Autowired
    private MatchmakingConfig config;

    @Override
    public ValidationResult validate(String hostScore, String guestScore, String rawScoreDetails) {
        try {
            int h = Integer.parseInt(hostScore.trim());
            int g = Integer.parseInt(guestScore.trim());
            if (h < 0 || g < 0) {
                return new ValidationResult(false, "Điểm số không được âm");
            }
            return new ValidationResult(true, null);
        } catch (NumberFormatException e) {
            return new ValidationResult(false, "Điểm số phải là số nguyên hợp lệ");
        }
    }

    @Override
    public NormalizedOutcome normalize(String hostScore, String guestScore, String rawScoreDetails) {
        int h = Integer.parseInt(hostScore.trim());
        int g = Integer.parseInt(guestScore.trim());
        if (h > g) {
            return NormalizedOutcome.WIN_HOST;
        } else if (g > h) {
            return NormalizedOutcome.WIN_GUEST;
        } else {
            return NormalizedOutcome.DRAW;
        }
    }

    @Override
    public double calculateG(String hostScore, String guestScore, String rawScoreDetails) {
        int h = Integer.parseInt(hostScore.trim());
        int g = Integer.parseInt(guestScore.trim());
        int margin = Math.abs(h - g);
        double scale = config.getBasketballScalePoints();
        double rawG = 0.5 + 0.5 * (margin / scale);
        return Math.max(0.5, Math.min(1.0, rawG));
    }

    @Override
    public String getCanonicalScoreText(String hostScore, String guestScore, String rawScoreDetails) {
        return hostScore.trim() + " - " + guestScore.trim() + " điểm";
    }
}
