package com.backend.sporta.service.matchmaking;

import com.backend.sporta.config.MatchmakingConfig;
import com.backend.sporta.entity.Match;
import com.backend.sporta.enums.MatchType;
import com.backend.sporta.enums.NormalizedOutcome;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class CRPEngineTest {

    @Mock
    private MatchmakingConfig config;

    @InjectMocks
    private CRPEngine crpEngine;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(config.getWinBase()).thenReturn(25);
        when(config.getLossBase()).thenReturn(15);
        when(config.getUpsetStepElo()).thenReturn(50);
        when(config.getZeroFloor()).thenReturn(0);
        when(config.getPairLimitCount()).thenReturn(2);
    }

    @Test
    void testFriendlyMatch_NoCRPChange() {
        Match match = Match.builder()
                .matchType(MatchType.FRIENDLY)
                .hostCrpBeforeSnapshot(100)
                .guestCrpBeforeSnapshot(100)
                .build();

        CRPEngine.CRPEngineResult result = crpEngine.calculate(match, NormalizedOutcome.WIN_HOST, 0.8, 0);
        assertFalse(result.isRankedEligible());
        assertEquals(0, result.getHostCrpDelta());
        assertEquals(0, result.getGuestCrpDelta());
        assertEquals(100, result.getHostCrpAfter());
    }

    @Test
    void testAntiFarmingRepeatLimitExceeded_NoCRPChange() {
        Match match = Match.builder()
                .matchType(MatchType.RANKED)
                .hostCrpBeforeSnapshot(100)
                .guestCrpBeforeSnapshot(100)
                .build();

        CRPEngine.CRPEngineResult result = crpEngine.calculate(match, NormalizedOutcome.WIN_HOST, 0.8, 2);
        assertFalse(result.isRankedEligible());
        assertEquals(0, result.getHostCrpDelta());
    }

    @Test
    void testRankedStrongerWins_ReducedBonus() {
        Match match = Match.builder()
                .matchType(MatchType.RANKED)
                .hostClubEloSnapshot(1650)
                .guestClubEloSnapshot(1500) // delta = 150 -> upset = 3
                .hostCrpBeforeSnapshot(100)
                .guestCrpBeforeSnapshot(100)
                .build();

        // G = 1.0. winBase = 25 - 3 = 22 gain. lossBase = 15 - 3 = 12 loss.
        CRPEngine.CRPEngineResult result = crpEngine.calculate(match, NormalizedOutcome.WIN_HOST, 1.0, 0);
        assertTrue(result.isRankedEligible());
        assertEquals(22, result.getHostCrpDelta());
        assertEquals(-12, result.getGuestCrpDelta());
        assertEquals(122, result.getHostCrpAfter());
        assertEquals(88, result.getGuestCrpAfter());
    }

    @Test
    void testRankedUnderdogWins_ExtraBonus() {
        Match match = Match.builder()
                .matchType(MatchType.RANKED)
                .hostClubEloSnapshot(1200)
                .guestClubEloSnapshot(1500) // Host is underdog, delta = 300 -> upset = 6
                .hostCrpBeforeSnapshot(50)
                .guestCrpBeforeSnapshot(200)
                .build();

        // Host wins: winBase = 25*1.0 + 6 = 31 gain. Guest loss = 15*1.0 + 6 = 21 loss.
        CRPEngine.CRPEngineResult result = crpEngine.calculate(match, NormalizedOutcome.WIN_HOST, 1.0, 0);
        assertTrue(result.isRankedEligible());
        assertEquals(31, result.getHostCrpDelta());
        assertEquals(-21, result.getGuestCrpDelta());
    }

    @Test
    void testZeroFloorConstraint() {
        Match match = Match.builder()
                .matchType(MatchType.RANKED)
                .hostClubEloSnapshot(1500)
                .guestClubEloSnapshot(1500)
                .hostCrpBeforeSnapshot(100)
                .guestCrpBeforeSnapshot(5) // Guest has low CRP
                .build();

        // Host wins: guest loss = 15. Guest CRP before = 5. Floor = 0.
        CRPEngine.CRPEngineResult result = crpEngine.calculate(match, NormalizedOutcome.WIN_HOST, 1.0, 0);
        assertEquals(0, result.getGuestCrpAfter());
    }
}
