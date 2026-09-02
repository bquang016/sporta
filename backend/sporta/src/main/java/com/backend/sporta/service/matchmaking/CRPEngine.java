package com.backend.sporta.service.matchmaking;

import com.backend.sporta.config.MatchmakingConfig;
import com.backend.sporta.entity.CRPLedger;
import com.backend.sporta.entity.Match;
import com.backend.sporta.enums.MatchType;
import com.backend.sporta.enums.NormalizedOutcome;
import com.backend.sporta.repository.CRPLedgerRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class CRPEngine {

    @Autowired
    private MatchmakingConfig config;

    @Autowired(required = false)
    private CRPLedgerRepository crpLedgerRepository;

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
        private int poolSubsidy;
        private int streakBonus;
        private int dailyBonus;
        private List<String> explanation;
    }

    public CRPEngineResult calculate(
            Match match,
            NormalizedOutcome outcome,
            double gFactor,
            int recentRankedMatchesCount
    ) {
        int hostCrpBefore = (match.getHostCrpBeforeSnapshot() != null && match.getHostCrpBeforeSnapshot() > 0)
                ? match.getHostCrpBeforeSnapshot()
                : (match.getHostClub() != null && match.getHostClub().getCrp() != null ? match.getHostClub().getCrp() : 100);

        int guestCrpBefore = (match.getGuestCrpBeforeSnapshot() != null && match.getGuestCrpBeforeSnapshot() > 0)
                ? match.getGuestCrpBeforeSnapshot()
                : (match.getGuestClub() != null && match.getGuestClub().getCrp() != null ? match.getGuestClub().getCrp() : 100);

        List<String> explanation = new ArrayList<>();

        MatchType mType = match.getMatchType() != null ? match.getMatchType() : (match.getRoom() != null ? match.getRoom().getMatchType() : MatchType.RANKED);
        boolean isRanked = mType == MatchType.RANKED;
        boolean withinRepeatLimit = recentRankedMatchesCount < config.getPairLimitCount();

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
                    .poolSubsidy(0)
                    .streakBonus(0)
                    .dailyBonus(0)
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
                    .poolSubsidy(0)
                    .streakBonus(0)
                    .dailyBonus(0)
                    .explanation(explanation)
                    .build();
        }

        int hostElo = match.getHostClubEloSnapshot() != null ? match.getHostClubEloSnapshot() : 1000;
        int guestElo = match.getGuestClubEloSnapshot() != null ? match.getGuestClubEloSnapshot() : 1000;

        int deltaElo = Math.abs(hostElo - guestElo);
        int upset = deltaElo / config.getUpsetStepElo();

        int winBase = config.getWinBase();

        int hostDelta = 0;
        int guestDelta = 0;
        int poolSubsidy = 0;
        int streakBonusAwarded = 0;
        int dailyBonusAwarded = 0;

        boolean poolEnabled = config.isPoolEnabled();
        double lossRatio = config.getLoserLossRatio(); // e.g. 0.70 (30% loss dampening)

        if (outcome == NormalizedOutcome.DRAW) {
            int eloDiff = hostElo - guestElo;
            if (Math.abs(eloDiff) < 50) {
                hostDelta = 0;
                guestDelta = 0;
                explanation.add("Kết quả Hòa (Elo ngang nhau) - CRP không đổi.");
            } else {
                int drawPenalty = Math.max(1, Math.min(5, Math.abs(eloDiff) / 100));
                if (poolEnabled) {
                    int dampenedLoss = Math.max(1, (int) Math.round(drawPenalty * lossRatio));
                    poolSubsidy = drawPenalty - dampenedLoss;
                    if (eloDiff > 0) {
                        hostDelta = -dampenedLoss;
                        guestDelta = +drawPenalty;
                        explanation.add("Kết quả Hòa (Host kèo trên): Host -" + dampenedLoss + " CRP (được Quỹ CRP Pool giảm trừ), Guest +" + drawPenalty + " CRP");
                        explanation.add("Quỹ CRP Pool trợ cấp: +" + poolSubsidy + " CRP");
                    } else {
                        guestDelta = -dampenedLoss;
                        hostDelta = +drawPenalty;
                        explanation.add("Kết quả Hòa (Guest kèo trên): Guest -" + dampenedLoss + " CRP (được Quỹ CRP Pool giảm trừ), Host +" + drawPenalty + " CRP");
                        explanation.add("Quỹ CRP Pool trợ cấp: +" + poolSubsidy + " CRP");
                    }
                } else {
                    hostDelta = eloDiff > 0 ? -drawPenalty : +drawPenalty;
                    guestDelta = -hostDelta;
                    if (eloDiff > 0) {
                        explanation.add("Kết quả Hòa (Host kèo trên): Host -" + drawPenalty + " CRP, Guest +" + drawPenalty + " CRP");
                    } else {
                        explanation.add("Kết quả Hòa (Guest kèo trên): Host +" + drawPenalty + " CRP, Guest -" + drawPenalty + " CRP");
                    }
                }
            }
        } else if (outcome == NormalizedOutcome.WIN_HOST) {
            int baseDelta = (int) Math.round(winBase * gFactor);
            int rawGain;
            if (hostElo >= guestElo) {
                rawGain = Math.max(1, baseDelta - upset);
                explanation.add("Host (Kèo trên/Ngang) thắng: +" + rawGain + " CRP (G-factor: " + String.format("%.2f", gFactor) + ", Upset: -" + upset + ")");
            } else {
                rawGain = Math.max(1, baseDelta + upset);
                explanation.add("Host (Kèo dưới lật kèo) thắng: +" + rawGain + " CRP (G-factor: " + String.format("%.2f", gFactor) + ", Upset thưởng: +" + upset + ")");
            }

            int loserLoss = poolEnabled ? Math.max(1, (int) Math.round(rawGain * lossRatio)) : rawGain;
            if (poolEnabled) {
                explanation.add("Trợ cấp CRP Pool: Guest chỉ bị trừ -" + loserLoss + " CRP (giảm " + (int) Math.round((1 - lossRatio) * 100) + "% áp lực thua)");

                // Check bonuses for winner (Host)
                Long hostClubId = match.getHostClub() != null ? match.getHostClub().getId() : null;
                int currentStreak = getClubWinStreak(hostClubId);
                if (currentStreak >= config.getStreakBonusThreshold() - 1) {
                    streakBonusAwarded = config.getStreakBonusCrp();
                    explanation.add("🔥 Thưởng Chuỗi Thắng (" + (currentStreak + 1) + " trận liên tiếp): +" + streakBonusAwarded + " CRP (Rút từ Quỹ Thưởng CRP)");
                }
                if (isClubFirstRankedMatchToday(hostClubId)) {
                    dailyBonusAwarded = config.getFirstMatchBonusCrp();
                    explanation.add("🌅 Thưởng Trận Xếp Hạng đầu tiên trong ngày: +" + dailyBonusAwarded + " CRP (Rút từ Quỹ Thưởng CRP)");
                }
            } else {
                explanation.add("Guest (Kèo dưới) thua: -" + loserLoss + " CRP");
            }

            int totalWinnerGain = rawGain + streakBonusAwarded + dailyBonusAwarded;
            poolSubsidy = totalWinnerGain - loserLoss;

            hostDelta = totalWinnerGain;
            guestDelta = -loserLoss;

            if (poolEnabled && poolSubsidy > 0) {
                explanation.add("🏦 Tổng Quỹ CRP Pool tài trợ trận đấu: +" + poolSubsidy + " CRP");
            }

        } else if (outcome == NormalizedOutcome.WIN_GUEST) {
            int baseDelta = (int) Math.round(winBase * gFactor);
            int rawGain;
            if (guestElo >= hostElo) {
                rawGain = Math.max(1, baseDelta - upset);
                explanation.add("Guest (Kèo trên/Ngang) thắng: +" + rawGain + " CRP (G-factor: " + String.format("%.2f", gFactor) + ", Upset: -" + upset + ")");
            } else {
                rawGain = Math.max(1, baseDelta + upset);
                explanation.add("Guest (Kèo dưới lật kèo) thắng: +" + rawGain + " CRP (G-factor: " + String.format("%.2f", gFactor) + ", Upset thưởng: +" + upset + ")");
            }

            int loserLoss = poolEnabled ? Math.max(1, (int) Math.round(rawGain * lossRatio)) : rawGain;
            if (poolEnabled) {
                explanation.add("Trợ cấp CRP Pool: Host chỉ bị trừ -" + loserLoss + " CRP (giảm " + (int) Math.round((1 - lossRatio) * 100) + "% áp lực thua)");

                // Check bonuses for winner (Guest)
                Long guestClubId = match.getGuestClub() != null ? match.getGuestClub().getId() : null;
                int currentStreak = getClubWinStreak(guestClubId);
                if (currentStreak >= config.getStreakBonusThreshold() - 1) {
                    streakBonusAwarded = config.getStreakBonusCrp();
                    explanation.add("🔥 Thưởng Chuỗi Thắng (" + (currentStreak + 1) + " trận liên tiếp): +" + streakBonusAwarded + " CRP (Rút từ Quỹ Thưởng CRP)");
                }
                if (isClubFirstRankedMatchToday(guestClubId)) {
                    dailyBonusAwarded = config.getFirstMatchBonusCrp();
                    explanation.add("🌅 Thưởng Trận Xếp Hạng đầu tiên trong ngày: +" + dailyBonusAwarded + " CRP (Rút từ Quỹ Thưởng CRP)");
                }
            } else {
                explanation.add("Host thua: -" + loserLoss + " CRP");
            }

            int totalWinnerGain = rawGain + streakBonusAwarded + dailyBonusAwarded;
            poolSubsidy = totalWinnerGain - loserLoss;

            guestDelta = totalWinnerGain;
            hostDelta = -loserLoss;

            if (poolEnabled && poolSubsidy > 0) {
                explanation.add("🏦 Tổng Quỹ CRP Pool tài trợ trận đấu: +" + poolSubsidy + " CRP");
            }
        }

        int rawHostAfter = hostCrpBefore + hostDelta;
        int rawGuestAfter = guestCrpBefore + guestDelta;

        int hostAfter = rawHostAfter;
        int guestAfter = rawGuestAfter;
        int zeroFloor = config.getZeroFloor();

        if (poolEnabled) {
            // With CRP Pool: Clamping loser does not penalize the winner!
            if (hostAfter < zeroFloor) {
                int actualLoss = hostCrpBefore - zeroFloor;
                poolSubsidy += (Math.abs(hostDelta) - actualLoss);
                hostAfter = zeroFloor;
            }
            if (guestAfter < zeroFloor) {
                int actualLoss = guestCrpBefore - zeroFloor;
                poolSubsidy += (Math.abs(guestDelta) - actualLoss);
                guestAfter = zeroFloor;
            }
        } else {
            // Strictly preserve Zero-Sum when floor clamp is triggered in non-pool mode
            if (hostAfter < zeroFloor) {
                int clampedLoss = hostCrpBefore - zeroFloor;
                hostAfter = zeroFloor;
                guestAfter = guestCrpBefore + clampedLoss;
            } else if (guestAfter < zeroFloor) {
                int clampedLoss = guestCrpBefore - zeroFloor;
                guestAfter = zeroFloor;
                hostAfter = hostCrpBefore + clampedLoss;
            }
        }

        CRPEngineResult res = CRPEngineResult.builder()
                .isRankedEligible(true)
                .hostCrpBefore(hostCrpBefore)
                .hostCrpDelta(hostAfter - hostCrpBefore)
                .hostCrpAfter(hostAfter)
                .guestCrpBefore(guestCrpBefore)
                .guestCrpDelta(guestAfter - guestCrpBefore)
                .guestCrpAfter(guestAfter)
                .gFactor(gFactor)
                .upsetModifier(upset)
                .poolSubsidy(poolSubsidy)
                .streakBonus(streakBonusAwarded)
                .dailyBonus(dailyBonusAwarded)
                .explanation(explanation)
                .build();

        log.info("[CRP Engine v2] Calculated for Match ID {}: Host ({} -> {}, delta={}), Guest ({} -> {}, delta={}), Pool Subsidy={}",
                match.getId(), hostCrpBefore, hostAfter, res.getHostCrpDelta(), guestCrpBefore, guestAfter, res.getGuestCrpDelta(), poolSubsidy);

        return res;
    }

    public int getClubWinStreak(Long clubId) {
        if (clubId == null || crpLedgerRepository == null) return 0;
        try {
            List<CRPLedger> recent = crpLedgerRepository.findTop10ByClubIdOrderByCreatedAtDesc(clubId);
            int streak = 0;
            for (CRPLedger ledger : recent) {
                if (ledger.getDeltaCrp() != null && ledger.getDeltaCrp() > 0) {
                    streak++;
                } else {
                    break;
                }
            }
            return streak;
        } catch (Exception e) {
            log.warn("Failed to check win streak for club {}: {}", clubId, e.getMessage());
            return 0;
        }
    }

    public boolean isClubFirstRankedMatchToday(Long clubId) {
        if (clubId == null || crpLedgerRepository == null) return true;
        try {
            LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
            long count = crpLedgerRepository.countByClubIdAndCreatedAtGreaterThanEqual(clubId, startOfDay);
            return count == 0;
        } catch (Exception e) {
            log.warn("Failed to check daily first match for club {}: {}", clubId, e.getMessage());
            return false;
        }
    }
}

