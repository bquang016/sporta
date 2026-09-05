package com.backend.sporta.service;

import com.backend.sporta.dto.LeaderboardResponse;
import com.backend.sporta.entity.Club;
import com.backend.sporta.entity.User;
import com.backend.sporta.enums.ClubMemberStatus;
import com.backend.sporta.repository.ClubMemberRepository;
import com.backend.sporta.repository.ClubRepository;
import com.backend.sporta.repository.UserRepository;
import com.backend.sporta.service.matchmaking.ClubEloService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class LeaderboardServiceImpl implements LeaderboardService {

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private ClubMemberRepository clubMemberRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClubEloService clubEloService;

    @Override
    @Transactional(readOnly = true)
    public List<LeaderboardResponse> getLeaderboard(Long sportId, String area, Integer page, Integer size) {
        return getLeaderboard(sportId, area, page, size, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaderboardResponse> getLeaderboard(Long sportId, String area, Integer page, Integer size, String userEmail) {
        List<Club> clubs = clubRepository.findLeaderboardClubs(sportId, (area != null && !area.isBlank()) ? area : null);

        Set<Long> userClubIds = new HashSet<>();
        if (userEmail != null && !userEmail.isBlank() && !userEmail.equals("anonymousUser")) {
            userRepository.findByEmail(userEmail).ifPresent(user -> {
                List<Club> joinedClubs = clubMemberRepository.findByUserIdAndStatus(user.getId(), ClubMemberStatus.APPROVED)
                        .stream().map(cm -> cm.getClub()).collect(Collectors.toList());
                for (Club jc : joinedClubs) {
                    if (jc != null) userClubIds.add(jc.getId());
                }
            });
        }
        
        int p = (page != null && page >= 0) ? page : 0;
        int s = (size != null && size > 0) ? size : 20;
        int start = Math.min(p * s, clubs.size());
        int end = Math.min(start + s, clubs.size());

        List<LeaderboardResponse> responseList = new ArrayList<>();
        for (int i = start; i < end; i++) {
            Club club = clubs.get(i);
            int rank = i + 1;
            int elo = clubEloService.getClubElo(club);
            String levelLabel = clubEloService.getLevelLabel(elo);
            int activeMembers = clubEloService.getActiveMemberCount(club.getId());

            int rankedWins = club.getRankedWins() != null ? club.getRankedWins() : 0;
            int finalMatches = club.getFinalMatches() != null ? club.getFinalMatches() : 0;
            int winRate = finalMatches > 0 ? (int) Math.round((double) rankedWins * 100.0 / finalMatches) : 0;

            String tier = "CHALLENGER";
            if (rank == 1) tier = "CHAMPION";
            else if (rank == 2) tier = "RUNNER_UP";
            else if (rank == 3) tier = "THIRD_PLACE";
            else if (rank <= 10) tier = "ELITE";

            String streak = "-";
            if (rankedWins >= 5) streak = "5W 🔥";
            else if (rankedWins > 0) streak = rankedWins + "W";

            boolean isUserClub = userClubIds.contains(club.getId());

            responseList.add(LeaderboardResponse.builder()
                    .rank(rank)
                    .clubId(club.getId())
                    .clubName(club.getName())
                    .avatarUrl(club.getAvatarImage())
                    .sportId(club.getSport() != null ? club.getSport().getId() : null)
                    .sportName(club.getSport() != null ? club.getSport().getName() : null)
                    .area(club.getArea())
                    .elo(elo)
                    .levelLabel(levelLabel)
                    .crp(club.getCrp() != null ? club.getCrp() : 0)
                    .rankedWins(rankedWins)
                    .finalMatches(finalMatches)
                    .winRate(winRate)
                    .streak(streak)
                    .tier(tier)
                    .isUserClub(isUserClub)
                    .activeMemberCount(activeMembers)
                    .build());
        }

        return responseList;
    }
}
