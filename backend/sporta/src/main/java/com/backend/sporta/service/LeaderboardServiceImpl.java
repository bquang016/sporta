package com.backend.sporta.service;

import com.backend.sporta.dto.LeaderboardResponse;
import com.backend.sporta.entity.Club;
import com.backend.sporta.repository.ClubRepository;
import com.backend.sporta.service.matchmaking.ClubEloService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class LeaderboardServiceImpl implements LeaderboardService {

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private ClubEloService clubEloService;

    @Override
    @Transactional(readOnly = true)
    public List<LeaderboardResponse> getLeaderboard(Long sportId, String area, Integer page, Integer size) {
        List<Club> clubs = clubRepository.findLeaderboardClubs(sportId, (area != null && !area.isBlank()) ? area : null);
        
        int p = (page != null && page >= 0) ? page : 0;
        int s = (size != null && size > 0) ? size : 20;
        int start = Math.min(p * s, clubs.size());
        int end = Math.min(start + s, clubs.size());

        List<LeaderboardResponse> responseList = new ArrayList<>();
        for (int i = start; i < end; i++) {
            Club club = clubs.get(i);
            int elo = clubEloService.getClubElo(club);
            String levelLabel = clubEloService.getLevelLabel(elo);
            int activeMembers = clubEloService.getActiveMemberCount(club.getId());

            responseList.add(LeaderboardResponse.builder()
                    .rank(i + 1)
                    .clubId(club.getId())
                    .clubName(club.getName())
                    .avatarUrl(club.getAvatarImage())
                    .sportId(club.getSport() != null ? club.getSport().getId() : null)
                    .sportName(club.getSport() != null ? club.getSport().getName() : null)
                    .area(club.getArea())
                    .elo(elo)
                    .levelLabel(levelLabel)
                    .crp(club.getCrp() != null ? club.getCrp() : 0)
                    .rankedWins(club.getRankedWins() != null ? club.getRankedWins() : 0)
                    .finalMatches(club.getFinalMatches() != null ? club.getFinalMatches() : 0)
                    .activeMemberCount(activeMembers)
                    .build());
        }

        return responseList;
    }
}
