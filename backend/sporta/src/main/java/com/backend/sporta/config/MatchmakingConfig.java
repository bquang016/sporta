package com.backend.sporta.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
@Setter
public class MatchmakingConfig {

    @Value("${matchmaking.join-cutoff-minutes:60}")
    private int joinCutoffMinutes = 60;

    @Value("${matchmaking.min-active-club-members:8}")
    private int minActiveClubMembers = 8;

    @Value("${ranking.crp.win-base:20}")
    private int winBase = 20;

    @Value("${ranking.crp.loss-base:20}")
    private int lossBase = 20;

    @Value("${ranking.crp.upset-step-elo:50}")
    private int upsetStepElo = 50;

    @Value("${ranking.crp.zero-floor:0}")
    private int zeroFloor = 0;

    @Value("${ranking.crp.draw-delta:0}")
    private int drawDelta = 0;

    @Value("${ranking.crp.pair-limit-count:10}")
    private int pairLimitCount = 10;

    @Value("${ranking.crp.pair-limit-window-days:7}")
    private int pairLimitWindowDays = 7;

    @Value("${ranking.crp.algorithm-version:crp-v2}")
    private String algorithmVersion = "crp-v2";

    @Value("${ranking.crp.pool-enabled:true}")
    private boolean poolEnabled = true;

    @Value("${ranking.crp.loser-loss-ratio:0.70}")
    private double loserLossRatio = 0.70;

    @Value("${ranking.crp.streak-bonus-threshold:3}")
    private int streakBonusThreshold = 3;

    @Value("${ranking.crp.streak-bonus-crp:5}")
    private int streakBonusCrp = 5;

    @Value("${ranking.crp.first-match-bonus-crp:3}")
    private int firstMatchBonusCrp = 3;

    @Value("${score.dominance.football-scale-goals:5.0}")
    private double footballScaleGoals = 5.0;

    @Value("${score.dominance.basketball-scale-points:30.0}")
    private double basketballScalePoints = 30.0;

    @Value("${result.confirmation-grace-minutes:60}")
    private int resultConfirmationGraceMinutes = 60;
}
