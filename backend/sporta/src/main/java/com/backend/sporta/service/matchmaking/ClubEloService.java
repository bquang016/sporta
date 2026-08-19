package com.backend.sporta.service.matchmaking;

import com.backend.sporta.config.MatchmakingConfig;
import com.backend.sporta.entity.Club;
import com.backend.sporta.entity.ClubMember;
import com.backend.sporta.entity.UserSport;
import com.backend.sporta.enums.ClubMemberStatus;
import com.backend.sporta.enums.SportLevel;
import com.backend.sporta.repository.ClubMemberRepository;
import com.backend.sporta.repository.UserSportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClubEloService {

    @Autowired
    private ClubMemberRepository clubMemberRepository;

    @Autowired
    private UserSportRepository userSportRepository;

    @Autowired
    private MatchmakingConfig config;

    public int getClubElo(Club club) {
        if (club == null) {
            return 1000;
        }
        List<ClubMember> activeMembers = clubMemberRepository.findByClubIdAndStatus(club.getId(), ClubMemberStatus.APPROVED);
        if (activeMembers.isEmpty()) {
            return club.getElo() != null ? club.getElo() : 1000;
        }

        Long sportId = club.getSport() != null ? club.getSport().getId() : null;
        int totalElo = 0;
        int count = 0;

        for (ClubMember member : activeMembers) {
            if (member.getUser() == null) continue;
            int memberElo = 1000; // default TB
            if (sportId != null) {
                Optional<UserSport> us = userSportRepository.findByUserIdAndSportId(member.getUser().getId(), sportId);
                if (us.isPresent() && us.get().getLevel() != null) {
                    memberElo = mapSportLevelToElo(us.get().getLevel());
                }
            }
            totalElo += memberElo;
            count++;
        }

        if (count == 0) {
            return club.getElo() != null ? club.getElo() : 1000;
        }

        return (int) Math.round((double) totalElo / count);
    }

    public int mapSportLevelToElo(SportLevel level) {
        if (level == null) return 1000;
        switch (level) {
            case WEAK:
                return 900;
            case WEAK_AVERAGE:
                return 1200;
            case AVERAGE:
                return 1500;
            case AVERAGE_GOOD:
                return 1800;
            case GOOD:
                return 2100;
            default:
                return 1000;
        }
    }

    public String getLevelLabel(int elo) {
        if (elo < 1050) return "Yếu";
        if (elo < 1350) return "TBY";
        if (elo < 1650) return "TB";
        if (elo < 1950) return "TBK";
        return "Khá";
    }

    public String getBalanceLabel(int hostElo, int guestElo) {
        int delta = Math.abs(hostElo - guestElo);
        if (delta < 200) {
            return "Cân kèo";
        } else if (delta < 400) {
            return "Chênh nhẹ";
        } else {
            return "Lệch trình";
        }
    }

    public int getActiveMemberCount(Long clubId) {
        return (int) clubMemberRepository.countByClubIdAndStatus(clubId, ClubMemberStatus.APPROVED);
    }

    public boolean isEligibleForMatchmaking(Long clubId) {
        return getActiveMemberCount(clubId) >= config.getMinActiveClubMembers();
    }
}
