package com.backend.sporta.service.matchmaking;

import com.backend.sporta.config.MatchmakingConfig;
import com.backend.sporta.enums.NormalizedOutcome;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class ScoreAdapterTest {

    @Mock
    private MatchmakingConfig config;

    @InjectMocks
    private FootballScoreAdapter footballScoreAdapter;

    @InjectMocks
    private BasketballScoreAdapter basketballScoreAdapter;

    private SetBasedScoreAdapter setBasedScoreAdapter = new SetBasedScoreAdapter();

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(config.getFootballScaleGoals()).thenReturn(5.0);
        when(config.getBasketballScalePoints()).thenReturn(30.0);
    }

    @Test
    void testFootballScoreAdapter() {
        ScoreAdapter.ValidationResult val = footballScoreAdapter.validate("3", "1", null);
        assertTrue(val.isValid());

        NormalizedOutcome outcome = footballScoreAdapter.normalize("3", "1", null);
        assertEquals(NormalizedOutcome.WIN_HOST, outcome);

        // margin = 2, scale = 5. G = 0.5 + 0.5 * (2/5) = 0.7
        double g = footballScoreAdapter.calculateG("3", "1", null);
        assertEquals(0.7, g, 0.001);
    }

    @Test
    void testSetBasedScoreAdapter() {
        ScoreAdapter.ValidationResult val = setBasedScoreAdapter.validate("2", "1", "21-18, 19-21, 21-15");
        assertTrue(val.isValid());

        NormalizedOutcome outcome = setBasedScoreAdapter.normalize("2", "1", null);
        assertEquals(NormalizedOutcome.WIN_HOST, outcome);

        // hSets = 2, gSets = 1, total = 3. G = 0.5 + 0.5 * (1/3) = 0.6666...
        double g = setBasedScoreAdapter.calculateG("2", "1", null);
        assertEquals(0.666, g, 0.01);
    }
}
