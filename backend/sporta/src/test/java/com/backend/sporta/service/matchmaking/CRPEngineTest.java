package com.backend.sporta.service.matchmaking;

import com.backend.sporta.config.MatchmakingConfig;
import com.backend.sporta.service.matchmaking.CRPEngine.CRPEngineResult;
import com.backend.sporta.entity.Club;
import com.backend.sporta.entity.Match;
import com.backend.sporta.entity.Sport;
import com.backend.sporta.enums.MatchType;
import com.backend.sporta.enums.NormalizedOutcome;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

public class CRPEngineTest {

    @InjectMocks
    private CRPEngine crpEngine;

    @Mock
    private MatchmakingConfig config;

    @Mock
    private ScoreAdapterRegistry scoreAdapterRegistry;

    @Mock
    private ScoreAdapter scoreAdapter;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(config.getWinBase()).thenReturn(20);
        when(config.getLossBase()).thenReturn(20);
        when(config.getUpsetStepElo()).thenReturn(50);
        when(config.getZeroFloor()).thenReturn(0);
        when(config.getPairLimitCount()).thenReturn(10);
        when(config.isPoolEnabled()).thenReturn(false);
        when(config.getLoserLossRatio()).thenReturn(0.70);
        when(config.getStreakBonusThreshold()).thenReturn(3);
        when(config.getStreakBonusCrp()).thenReturn(5);
        when(config.getFirstMatchBonusCrp()).thenReturn(3);
        when(scoreAdapterRegistry.getAdapter(anyString())).thenReturn(scoreAdapter);
        when(scoreAdapter.calculateG(anyString(), anyString(), anyString())).thenReturn(1.0);
    }

    @Test
    @DisplayName("Pure Zero-Sum invariant when pool is disabled: winnerGain + loserLoss == 0")
    void testZeroSumInvariant() {
        Sport sport = Sport.builder().id(1L).name("Bóng đá").build();
        Club host = Club.builder().id(1L).sport(sport).name("Club A").crp(100).build();
        Club guest = Club.builder().id(2L).sport(sport).name("Club B").crp(100).build();

        Match match = Match.builder()
                .id(UUID.randomUUID())
                .hostClub(host)
                .guestClub(guest)
                .matchType(MatchType.RANKED)
                .hostClubEloSnapshot(1500)
                .guestClubEloSnapshot(1500)
                .hostCrpBeforeSnapshot(100)
                .guestCrpBeforeSnapshot(100)
                .build();

        CRPEngineResult result = crpEngine.calculate(match, NormalizedOutcome.WIN_HOST, 1.0, 0);

        assertTrue(result.isRankedEligible());
        assertEquals(20, result.getHostCrpDelta());
        assertEquals(-20, result.getGuestCrpDelta());
        assertEquals(0, result.getHostCrpDelta() + result.getGuestCrpDelta(), "Sum of CRP deltas must be exactly zero when pool is disabled");
    }

    @Test
    @DisplayName("CRP Pool enabled: Loser only loses 70%, Pool subsidizes 30%")
    void testCRPPoolLossDampening() {
        when(config.isPoolEnabled()).thenReturn(true);

        Sport sport = Sport.builder().id(1L).name("Bóng đá").build();
        Club host = Club.builder().id(1L).sport(sport).name("Club A").crp(100).build();
        Club guest = Club.builder().id(2L).sport(sport).name("Club B").crp(100).build();

        Match match = Match.builder()
                .id(UUID.randomUUID())
                .hostClub(host)
                .guestClub(guest)
                .matchType(MatchType.RANKED)
                .hostClubEloSnapshot(1500)
                .guestClubEloSnapshot(1500)
                .hostCrpBeforeSnapshot(100)
                .guestCrpBeforeSnapshot(100)
                .build();

        CRPEngineResult result = crpEngine.calculate(match, NormalizedOutcome.WIN_HOST, 1.0, 0);

        // Base = 20 + Daily Bonus = 3 -> Total Winner Gain = 23.
        // Guest loss = 20 * 0.70 = 14 (30% loss dampening).
        // Total Pool subsidy = 23 - 14 = 9.
        assertEquals(23, result.getHostCrpDelta());
        assertEquals(-14, result.getGuestCrpDelta());
        assertEquals(3, result.getDailyBonus());
        assertEquals(9, result.getPoolSubsidy());
        assertEquals(123, result.getHostCrpAfter());
        assertEquals(86, result.getGuestCrpAfter());
    }

    @Test
    @DisplayName("Underdog upset win yields higher CRP")
    void testUnderdogUpsetWin() {
        Sport sport = Sport.builder().id(1L).name("Bóng đá").build();
        Club underdogHost = Club.builder().id(1L).sport(sport).name("Club A").crp(50).build();
        Club favoriteGuest = Club.builder().id(2L).sport(sport).name("Club B").crp(200).build();

        Match match = Match.builder()
                .id(UUID.randomUUID())
                .hostClub(underdogHost)
                .guestClub(favoriteGuest)
                .matchType(MatchType.RANKED)
                .hostClubEloSnapshot(1200)
                .guestClubEloSnapshot(1600)
                .hostCrpBeforeSnapshot(50)
                .guestCrpBeforeSnapshot(200)
                .build();

        CRPEngineResult result = crpEngine.calculate(match, NormalizedOutcome.WIN_HOST, 1.0, 0);

        // deltaElo = 400, upset = 400 / 50 = 8. Base = 20. Gain = 28, Loss = -28.
        assertEquals(28, result.getHostCrpDelta());
        assertEquals(-28, result.getGuestCrpDelta());
        assertEquals(0, result.getHostCrpDelta() + result.getGuestCrpDelta());
    }

    @Test
    @DisplayName("Zero-Sum is strictly preserved even when loser hits zero floor in pure zero-sum mode")
    void testZeroSumWhenLoserHitsZeroFloor() {
        Sport sport = Sport.builder().id(1L).name("Bóng đá").build();
        Club host = Club.builder().id(1L).sport(sport).name("Club A").crp(100).build();
        Club poorGuest = Club.builder().id(2L).sport(sport).name("Club B").crp(5).build();

        Match match = Match.builder()
                .id(UUID.randomUUID())
                .hostClub(host)
                .guestClub(poorGuest)
                .matchType(MatchType.RANKED)
                .hostClubEloSnapshot(1500)
                .guestClubEloSnapshot(1500)
                .hostCrpBeforeSnapshot(100)
                .guestCrpBeforeSnapshot(5)
                .build();

        CRPEngineResult result = crpEngine.calculate(match, NormalizedOutcome.WIN_HOST, 1.0, 0);

        // Guest only has 5 CRP to lose, so delta is -5, and host gain is clamped to +5
        assertEquals(0, result.getGuestCrpAfter());
        assertEquals(-5, result.getGuestCrpDelta());
        assertEquals(5, result.getHostCrpDelta());
        assertEquals(105, result.getHostCrpAfter());
        assertEquals(0, result.getHostCrpDelta() + result.getGuestCrpDelta(), "Zero-Sum must hold even at floor clamp");
    }

    @Test
    @DisplayName("Draw between unequal Elo teams penalizes favorite and rewards underdog")
    void testDrawWithEloDifference() {
        Sport sport = Sport.builder().id(1L).name("Bóng đá").build();
        Club strongHost = Club.builder().id(1L).sport(sport).name("Club A").crp(100).build();
        Club weakGuest = Club.builder().id(2L).sport(sport).name("Club B").crp(100).build();

        Match match = Match.builder()
                .id(UUID.randomUUID())
                .hostClub(strongHost)
                .guestClub(weakGuest)
                .matchType(MatchType.RANKED)
                .hostClubEloSnapshot(1800)
                .guestClubEloSnapshot(1500)
                .hostCrpBeforeSnapshot(100)
                .guestCrpBeforeSnapshot(100)
                .build();

        CRPEngineResult result = crpEngine.calculate(match, NormalizedOutcome.DRAW, 1.0, 0);

        // eloDiff = 300 -> penalty = 3
        assertEquals(-3, result.getHostCrpDelta());
        assertEquals(3, result.getGuestCrpDelta());
        assertEquals(0, result.getHostCrpDelta() + result.getGuestCrpDelta());
    }
}

