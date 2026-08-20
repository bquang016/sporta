package com.backend.sporta.service.matchmaking;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ScoreAdapterRegistry {

    @Autowired
    private FootballScoreAdapter footballScoreAdapter;

    @Autowired
    private SetBasedScoreAdapter setBasedScoreAdapter;

    @Autowired
    private BasketballScoreAdapter basketballScoreAdapter;

    public ScoreAdapter getAdapter(String sportName) {
        if (sportName == null) {
            return footballScoreAdapter;
        }
        String normalizedName = sportName.toLowerCase().trim();
        if (normalizedName.contains("bóng đá") || normalizedName.contains("football") || normalizedName.contains("soccer")) {
            return footballScoreAdapter;
        } else if (normalizedName.contains("bóng rổ") || normalizedName.contains("basketball")) {
            return basketballScoreAdapter;
        } else if (normalizedName.contains("cầu lông") || normalizedName.contains("badminton") ||
                   normalizedName.contains("pickleball") || normalizedName.contains("tennis") ||
                   normalizedName.contains("bóng chuyền") || normalizedName.contains("volleyball")) {
            return setBasedScoreAdapter;
        }
        return footballScoreAdapter;
    }
}
