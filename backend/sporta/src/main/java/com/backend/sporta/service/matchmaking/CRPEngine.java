package com.backend.sporta.service.matchmaking;

import com.backend.sporta.config.MatchmakingConfig;
import com.backend.sporta.entity.Match;
import com.backend.sporta.enums.MatchType;
import com.backend.sporta.enums.NormalizedOutcome;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CRPEngine {

    @Autowired
    private MatchmakingConfig config;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CRPEngineResult {
        private boolean isRankedEligible;
        private int hostCrpBefore;
        private int hostCrpDelta;
        private int hostCrpAfter;
        private int guestCrpBefore;
        private int guestCrpDelta;
        private int guestCrpAfter;
        private double gFactor;
        private int upsetModifier;
        private List<String> explanation;
    }

    public CRPEngineResult calculate(
            Match match,
            NormalizedOutcome outcome,
            double gFactor,
            int recentRankedMatchesCount
    ) {
        int hostCrpBefore = match.getHostCrpBeforeSnapshot() != null ? match.getHostCrpBeforeSnapshot() : 0;
        int guestCrpBefore = match.getGuestCrpBeforeSnapshot() != null ? match.getGuestCrpBeforeSnapshot() : 0;
        List<String> explanation = new ArrayList<>();

        boolean isRanked = match.getMatchType() == MatchType.RANKED;
        boolean withinRepeatLimit = recentRankedMatchesCount < config.getPairLimitCount();
        boolean eligible = isRanked && withinRepeatLimit;

        if (!isRanked) {
            explanation.add("Trận đấu Giao hữu (Friendly) - Không tính điểm xếp hạng CRP.");
            return CRPEngineResult.builder()
                    .isRankedEligible(false)
                    .hostCrpBefore(hostCrpBefore)
                    .hostCrpDelta(0)
                    .hostCrpAfter(hostCrpBefore)
                    .guestCrpBefore(guestCrpBefore)
                    .guestCrpDelta(0)
                    .guestCrpAfter(guestCrpBefore)
                    .gFactor(gFactor)
                    .upsetModifier(0)
                    .explanation(explanation)
                    .build();
        }

        if (!withinRepeatLimit) {
            explanation.add("Đã vượt quá giới hạn " + config.getPairLimitCount() + " trận Xếp hạng trong 7 ngày giữa 2 CLB (Anti-farming) - Điểm CRP không đổi.");
            return CRPEngineResult.builder()
                    .isRankedEligible(false)
                    .hostCrpBefore(hostCrpBefore)
                    .hostCrpDelta(0)
                    .hostCrpAfter(hostCrpBefore)
                    .guestCrpBefore(guestCrpBefore)
                    .guestCrpDelta(0)
                    .guestCrpAfter(guestCrpBefore)
                    .gFactor(gFactor)
                    .upsetModifier(0)
                    .explanation(explanation)
                    .build();
        }

        if (outcome == NormalizedOutcome.DRAW) {
            explanation.add("Kết quả Hòa (Draw) - CRP không thay đổi.");
            return CRPEngineResult.builder()
                    .isRankedEligible(true)
                    .hostCrpBefore(hostCrpBefore)
                    .hostCrpDelta(0)
                    .hostCrpAfter(hostCrpBefore)
                    .guestCrpBefore(guestCrpBefore)
                    .guestCrpDelta(0)
                    .guestCrpAfter(guestCrpBefore)
                    .gFactor(gFactor)
                    .upsetModifier(0)
                    .explanation(explanation)
                    .build();
        }

        int hostElo = match.getHostClubEloSnapshot() != null ? match.getHostClubEloSnapshot() : 1000;
        int guestElo = match.getGuestClubEloSnapshot() != null ? match.getGuestClubEloSnapshot() : 1000;
        int deltaElo = Math.abs(hostElo - guestElo);
        int upset = deltaElo / config.getUpsetStepElo();

        int winBase = config.getWinBase();
        int lossBase = config.getLossBase();

        int hostDelta = 0;
        int guestDelta = 0;

        if (outcome == NormalizedOutcome.WIN_HOST) {
            if (hostElo >= guestElo) {
                // Host is stronger/equal
                int winnerGain = Math.max(1, (int) Math.round(winBase * gFactor - upset));
                int loserLoss = Math.max(1, (int) Math.round(lossBase * gFactor - upset));
                hostDelta = winnerGain;
                guestDelta = -loserLoss;
                explanation.add("Host (Kèo trên/Ngang) thắng: +" + winnerGain + " CRP (G-factor: " + String.format("%.2f", gFactor) + ", Upset: -" + upset + ")");
                explanation.add("Guest (Kèo dưới) thua: -" + loserLoss + " CRP");
            } else {
                // Host is underdog
                int winnerGain = Math.max(1, (int) Math.round(winBase * gFactor + upset));
                int loserLoss = Math.max(1, (int) Math.round(lossBase * gFactor + upset));
                hostDelta = winnerGain;
                guestDelta = -loserLoss;
                explanation.add("Host (Kèo dưới lật kèo) thắng: +" + winnerGain + " CRP (G-factor: " + String.format("%.2f", gFactor) + ", Upset thưởng: +" + upset + ")");
                explanation.add("Guest (Kèo trên) thua: -" + loserLoss + " CRP");
            }
        } else if (outcome == NormalizedOutcome.WIN_GUEST) {
            if (guestElo >= hostElo) {
                // Guest is stronger/equal
                int winnerGain = Math.max(1, (int) Math.round(winBase * gFactor - upset));
                int loserLoss = Math.max(1, (int) Math.round(lossBase * gFactor - upset));
                guestDelta = winnerGain;
                hostDelta = -loserLoss;
                explanation.add("Guest (Kèo trên/Ngang) thắng: +" + winnerGain + " CRP (G-factor: " + String.format("%.2f", gFactor) + ", Upset: -" + upset + ")");
                explanation.add("Host (Kèo dưới) thua: -" + loserLoss + " CRP");
            } else {
                // Guest is underdog
                int winnerGain = Math.max(1, (int) Math.round(winBase * gFactor + upset));
                int loserLoss = Math.max(1, (int) Math.round(lossBase * gFactor + upset));
                guestDelta = winnerGain;
                hostDelta = -loserLoss;
                explanation.add("Guest (Kèo dưới lật kèo) thắng: +" + winnerGain + " CRP (G-factor: " + String.format("%.2f", gFactor) + ", Upset thưởng: +" + upset + ")");
                explanation.add("Host (Kèo trên) thua: -" + loserLoss + " CRP");
            }
        }

        int hostAfter = Math.max(config.getZeroFloor(), hostCrpBefore + hostDelta);
        int guestAfter = Math.max(config.getZeroFloor(), guestCrpBefore + guestDelta);

        return CRPEngineResult.builder()
                .isRankedEligible(true)
                .hostCrpBefore(hostCrpBefore)
                .hostCrpDelta(hostAfter - hostCrpBefore)
                .hostCrpAfter(hostAfter)
                .guestCrpBefore(guestCrpBefore)
                .guestCrpDelta(guestAfter - guestCrpBefore)
                .guestCrpAfter(guestAfter)
                .gFactor(gFactor)
                .upsetModifier(upset)
                .explanation(explanation)
                .build();
    }
}
