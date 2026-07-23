package com.backend.sporta.service;

import com.backend.sporta.entity.Club;
import com.backend.sporta.entity.UserSport;
import com.backend.sporta.repository.ClubRepository;
import com.backend.sporta.repository.UserSportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EloRatingService {

    private final UserSportRepository userSportRepository;
    private final ClubRepository clubRepository;

    public static class MatchResultData {
        public double newEloA;
        public double newEloB;
        public int crpChangeA;
        public int crpChangeB;
    }

    /**
     * Cập nhật điểm Elo cá nhân của các cầu thủ và điểm CRP của 2 CLB dựa trên tỷ số trận đấu
     */
    @Transactional
    public void processMatchRating(
            Club clubA, List<UserSport> playersA,
            Club clubB, List<UserSport> playersB,
            int goalsA, int goalsB
    ) {
        // 1. Tính toán Elo trung bình của 2 đội
        double avgEloA = playersA.isEmpty() ? 1200.0 : playersA.stream().mapToDouble(UserSport::getElo).average().orElse(1200.0);
        double avgEloB = playersB.isEmpty() ? 1200.0 : playersB.stream().mapToDouble(UserSport::getElo).average().orElse(1200.0);

        // 2. Điểm kỳ vọng E
        double expectedA = 1.0 / (1.0 + Math.pow(10, (avgEloB - avgEloA) / 400.0));
        double expectedB = 1.0 - expectedA;

        // 3. Kết quả thực tế S
        double scoreA = goalsA > goalsB ? 1.0 : (goalsA == goalsB ? 0.5 : 0.0);
        double scoreB = goalsB > goalsA ? 1.0 : (goalsA == goalsB ? 0.5 : 0.0);

        // 4. Hệ số áp đảo G (G-Factor) dựa trên bàn thắng
        int totalGoals = goalsA + goalsB;
        double gFactor = 0.5;
        if (totalGoals > 0) {
            gFactor = 0.5 + 0.5 * ((double) Math.abs(goalsA - goalsB) / totalGoals);
        }

        // 5. Cập nhật Elo cá nhân cho từng cầu thủ Đội A
        for (UserSport player : playersA) {
            int kFactor = (player.getMatchesPlayed() != null && player.getMatchesPlayed() <= 3) ? 150 : 60;
            double delta = kFactor * gFactor * (scoreA - expectedA);
            double newElo = Math.max(0.0, player.getElo() + delta);
            newElo = BigDecimal.valueOf(newElo).setScale(1, RoundingMode.HALF_UP).doubleValue();

            player.setElo(newElo);
            player.setMatchesPlayed((player.getMatchesPlayed() == null ? 0 : player.getMatchesPlayed()) + 1);
            userSportRepository.save(player);
        }

        // Cập nhật Elo cá nhân cho từng cầu thủ Đội B
        for (UserSport player : playersB) {
            int kFactor = (player.getMatchesPlayed() != null && player.getMatchesPlayed() <= 3) ? 150 : 60;
            double delta = kFactor * gFactor * (scoreB - expectedB);
            double newElo = Math.max(0.0, player.getElo() + delta);
            newElo = BigDecimal.valueOf(newElo).setScale(1, RoundingMode.HALF_UP).doubleValue();

            player.setElo(newElo);
            player.setMatchesPlayed((player.getMatchesPlayed() == null ? 0 : player.getMatchesPlayed()) + 1);
            userSportRepository.save(player);
        }

        // 6. Cập nhật CRP cho CLB (Club Ranking Points)
        double deltaElo = Math.abs(avgEloA - avgEloB);
        int upset = (int) Math.floor(deltaElo / 50.0);

        int crpChangeA = 0;
        int crpChangeB = 0;

        if (scoreA == 1.0) { // Đội A Thắng
            boolean isFavoriteA = avgEloA >= avgEloB;
            if (isFavoriteA) { // Kèo Trên thắng
                crpChangeA = (int) Math.max(1, Math.round(25 * gFactor - upset));
                crpChangeB = (int) Math.max(1, Math.round(15 * gFactor - upset));
            } else { // Kèo Dưới thắng (Địa chấn)
                crpChangeA = (int) Math.max(1, Math.round(25 * gFactor + upset));
                crpChangeB = (int) Math.max(1, Math.round(15 * gFactor + upset));
            }

            int newCrpA = clubA.getCrp() == null ? 100 + crpChangeA : clubA.getCrp() + crpChangeA;
            int newCrpB = clubB.getCrp() == null ? Math.max(0, 100 - crpChangeB) : Math.max(0, clubB.getCrp() - crpChangeB);

            clubA.setCrp(newCrpA);
            clubB.setCrp(newCrpB);
        } else if (scoreB == 1.0) { // Đội B Thắng
            boolean isFavoriteB = avgEloB >= avgEloA;
            if (isFavoriteB) { // Kèo Trên thắng
                crpChangeB = (int) Math.max(1, Math.round(25 * gFactor - upset));
                crpChangeA = (int) Math.max(1, Math.round(15 * gFactor - upset));
            } else { // Kèo Dưới thắng (Địa chấn)
                crpChangeB = (int) Math.max(1, Math.round(25 * gFactor + upset));
                crpChangeA = (int) Math.max(1, Math.round(15 * gFactor + upset));
            }

            int newCrpB = clubB.getCrp() == null ? 100 + crpChangeB : clubB.getCrp() + crpChangeB;
            int newCrpA = clubA.getCrp() == null ? Math.max(0, 100 - crpChangeA) : Math.max(0, clubA.getCrp() - crpChangeA);

            clubA.setCrp(newCrpA);
            clubB.setCrp(newCrpB);
        } else { // Hòa
            crpChangeA = (int) Math.max(1, Math.round(10 * gFactor));
            crpChangeB = (int) Math.max(1, Math.round(10 * gFactor));

            clubA.setCrp((clubA.getCrp() == null ? 100 : clubA.getCrp()) + crpChangeA);
            clubB.setCrp((clubB.getCrp() == null ? 100 : clubB.getCrp()) + crpChangeB);
        }

        clubA.setMatchesPlayed((clubA.getMatchesPlayed() == null ? 0 : clubA.getMatchesPlayed()) + 1);
        clubB.setMatchesPlayed((clubB.getMatchesPlayed() == null ? 0 : clubB.getMatchesPlayed()) + 1);

        clubRepository.save(clubA);
        clubRepository.save(clubB);
    }
}
