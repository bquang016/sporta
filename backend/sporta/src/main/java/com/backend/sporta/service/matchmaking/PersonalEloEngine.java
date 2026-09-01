package com.backend.sporta.service.matchmaking;

import com.backend.sporta.entity.UserSport;
import com.backend.sporta.enums.EloSourceType;
import com.backend.sporta.enums.EloStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PersonalEloEngine {

    public static final int PLACEMENT_THRESHOLD = 5;
    public static final int VETERAN_THRESHOLD = 30;
    public static final int K_FACTOR_PLACEMENT = 56; // Fast drop on upset loss, steady gain on win (+20 to +28)
    public static final int K_FACTOR_NEWBIE = 28;    // Moderate steady calibration (+14 to +20)
    public static final int K_FACTOR_VETERAN = 16;   // Stable veteran Elo (+8 to +12)
    public static final int K_FACTOR_XE_VE = 20;

    /**
     * Standard Elo Rating formula with Margin of Victory:
     * expectedScore = 1.0 / (1.0 + 10^((opponentElo - myElo) / 400))
     * marginFactor = 1.0 + min(0.4, (scoreDiff - 1) * 0.05)
     * delta = K * (actualScore - expectedScore) * marginFactor
     */
    public int calculateNewElo(int myElo, int opponentElo, double actualScore, int kFactor, int scoreDiff) {
        double expectedScore = 1.0 / (1.0 + Math.pow(10.0, (opponentElo - myElo) / 400.0));
        double marginFactor = 1.0;
        if (scoreDiff > 1) {
            marginFactor = 1.0 + Math.min(0.4, (scoreDiff - 1) * 0.05);
        }
        double delta = kFactor * (actualScore - expectedScore) * marginFactor;
        return (int) Math.round(myElo + delta);
    }

    public int getKFactor(UserSport userSport, EloSourceType matchType) {
        if (matchType == EloSourceType.XE_VE) {
            return K_FACTOR_XE_VE;
        }
        if (userSport == null) {
            return K_FACTOR_PLACEMENT;
        }
        if (userSport.getEloStatus() == EloStatus.CALIBRATING
                || userSport.getEloStatus() == EloStatus.UNVERIFIED
                || userSport.getPlacementMatchesPlayed() == null
                || userSport.getPlacementMatchesPlayed() < PLACEMENT_THRESHOLD) {
            return K_FACTOR_PLACEMENT;
        }
        int totalMatches = userSport.getTotalRankedMatches() != null ? userSport.getTotalRankedMatches() : 0;
        if (totalMatches < VETERAN_THRESHOLD) {
            return K_FACTOR_NEWBIE;
        }
        return K_FACTOR_VETERAN;
    }

    public int updatePlayerStats(UserSport us, int opponentTeamElo, double score, EloSourceType sourceType, int scoreDiff) {
        if (us == null) return 0;

        int currentElo = us.getEffectiveElo();
        int kFactor = getKFactor(us, sourceType);
        int newElo = calculateNewElo(currentElo, opponentTeamElo, score, kFactor, scoreDiff);
        int delta = newElo - currentElo;

        us.setEloRating(newElo);
        us.setTotalRankedMatches((us.getTotalRankedMatches() != null ? us.getTotalRankedMatches() : 0) + 1);
        if (Double.compare(score, 1.0) == 0 || score >= 0.99) {
            us.setTotalWins((us.getTotalWins() != null ? us.getTotalWins() : 0) + 1);
        }
        us.setLastMatchAt(LocalDateTime.now());

        if (us.getEloStatus() == null || us.getEloStatus() == EloStatus.UNVERIFIED || us.getEloStatus() == EloStatus.CALIBRATING) {
            int played = (us.getPlacementMatchesPlayed() != null ? us.getPlacementMatchesPlayed() : 0) + 1;
            us.setPlacementMatchesPlayed(played);
            if (played >= PLACEMENT_THRESHOLD) {
                us.setEloStatus(EloStatus.VERIFIED);
            } else {
                us.setEloStatus(EloStatus.CALIBRATING);
            }
        }

        return delta;
    }

    public void updatePlayerStats(UserSport us, int opponentTeamElo, double score, EloSourceType sourceType) {
        updatePlayerStats(us, opponentTeamElo, score, sourceType, 0);
    }
}

