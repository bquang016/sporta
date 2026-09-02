package com.backend.sporta.service.matchmaking;

import com.backend.sporta.entity.UserSport;
import com.backend.sporta.enums.EloSourceType;
import com.backend.sporta.enums.EloStatus;
import com.backend.sporta.enums.SportLevel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class PersonalEloEngineTest {

    private PersonalEloEngine eloEngine;

    @BeforeEach
    void setUp() {
        eloEngine = new PersonalEloEngine();
    }

    @Test
    @DisplayName("Equal Elo: Winner gains K/2, Loser drops K/2")
    void testEqualEloWin() {
        int myElo = 1500;
        int opponentElo = 1500;
        int k = 48;

        int newWinElo = eloEngine.calculateNewElo(myElo, opponentElo, 1.0, k);
        int newLossElo = eloEngine.calculateNewElo(myElo, opponentElo, 0.0, k);
        int newDrawElo = eloEngine.calculateNewElo(myElo, opponentElo, 0.5, k);

        assertEquals(1524, newWinElo);
        assertEquals(1476, newLossElo);
        assertEquals(1500, newDrawElo);
    }

    @Test
    @DisplayName("Underdog wins vs higher Elo gains more points")
    void testUnderdogWin() {
        int myElo = 1200;
        int opponentElo = 1600;
        int k = 48;

        int newWinElo = eloEngine.calculateNewElo(myElo, opponentElo, 1.0, k);
        // expected score ~ 0.09, delta = 48 * (1 - 0.09) = ~44
        assertTrue(newWinElo >= 1240, "Underdog winning should gain >= 40 Elo points");
    }

    @Test
    @DisplayName("K-Factor determination based on calibration status")
    void testKFactorRules() {
        UserSport unverified = UserSport.builder()
                .level(SportLevel.AVERAGE)
                .eloStatus(EloStatus.UNVERIFIED)
                .placementMatchesPlayed(0)
                .totalRankedMatches(0)
                .build();

        assertEquals(48, eloEngine.getKFactor(unverified, EloSourceType.CLUB_RANKED));

        UserSport calibrating = UserSport.builder()
                .level(SportLevel.AVERAGE)
                .eloStatus(EloStatus.CALIBRATING)
                .placementMatchesPlayed(3)
                .totalRankedMatches(3)
                .build();

        assertEquals(48, eloEngine.getKFactor(calibrating, EloSourceType.CLUB_RANKED));

        UserSport earlyVerified = UserSport.builder()
                .level(SportLevel.AVERAGE)
                .eloStatus(EloStatus.VERIFIED)
                .placementMatchesPlayed(5)
                .totalRankedMatches(10)
                .build();

        assertEquals(24, eloEngine.getKFactor(earlyVerified, EloSourceType.CLUB_RANKED));

        UserSport veteran = UserSport.builder()
                .level(SportLevel.AVERAGE)
                .eloStatus(EloStatus.VERIFIED)
                .placementMatchesPlayed(5)
                .totalRankedMatches(35)
                .build();

        assertEquals(16, eloEngine.getKFactor(veteran, EloSourceType.CLUB_RANKED));

        // Xé Vé always overrides K to 16
        assertEquals(16, eloEngine.getKFactor(unverified, EloSourceType.XE_VE));
        assertEquals(16, eloEngine.getKFactor(calibrating, EloSourceType.XE_VE));
    }

    @Test
    @DisplayName("updatePlayerStats transitions status from UNVERIFIED -> CALIBRATING -> VERIFIED after 5 matches")
    void testCalibrationLifecycle() {
        UserSport us = UserSport.builder()
                .level(SportLevel.AVERAGE)
                .eloRating(1500)
                .eloStatus(EloStatus.UNVERIFIED)
                .placementMatchesPlayed(0)
                .totalRankedMatches(0)
                .totalWins(0)
                .build();

        // 1st match: Win -> CALIBRATING
        eloEngine.updatePlayerStats(us, 1500, 1.0, EloSourceType.CLUB_RANKED);
        assertEquals(EloStatus.CALIBRATING, us.getEloStatus());
        assertEquals(1, us.getPlacementMatchesPlayed());
        assertEquals(1, us.getTotalRankedMatches());
        assertEquals(1, us.getTotalWins());
        assertEquals(1524, us.getEffectiveElo());

        // 2nd match: Loss -> CALIBRATING
        eloEngine.updatePlayerStats(us, 1524, 0.0, EloSourceType.CLUB_RANKED);
        assertEquals(EloStatus.CALIBRATING, us.getEloStatus());
        assertEquals(2, us.getPlacementMatchesPlayed());
        assertEquals(2, us.getTotalRankedMatches());
        assertEquals(1, us.getTotalWins());

        // 3rd & 4th match
        eloEngine.updatePlayerStats(us, 1500, 0.5, EloSourceType.CLUB_RANKED);
        eloEngine.updatePlayerStats(us, 1500, 1.0, EloSourceType.CLUB_RANKED);
        assertEquals(4, us.getPlacementMatchesPlayed());
        assertEquals(EloStatus.CALIBRATING, us.getEloStatus());

        // 5th match: Completes placement -> VERIFIED
        eloEngine.updatePlayerStats(us, 1500, 1.0, EloSourceType.CLUB_RANKED);
        assertEquals(5, us.getPlacementMatchesPlayed());
        assertEquals(EloStatus.VERIFIED, us.getEloStatus());
    }
}
