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
        double weightedTotal = 0.0;
        double totalWeight = 0.0;

        for (ClubMember member : activeMembers) {
            if (member.getUser() == null) continue;
            int memberElo = 1000;
            double weight = 0.5; // base weight for unverified

            if (sportId != null) {
                Optional<UserSport> us = userSportRepository.findByUserIdAndSportId(member.getUser().getId(), sportId);
                if (us.isPresent()) {
                    UserSport userSport = us.get();
                    memberElo = userSport.getEffectiveElo();
                    if (userSport.getEloStatus() != null) {
                        weight = switch (userSport.getEloStatus()) {
                            case VERIFIED -> 1.0;
                            case CALIBRATING -> 0.75;
                            case UNVERIFIED -> 0.5;
                        };
                    }
                }
            }

            if (member.getRole() == com.backend.sporta.enums.ClubMemberRole.ADMIN
                    || member.getRole() == com.backend.sporta.enums.ClubMemberRole.SUB_LEADER) {
                weight *= 1.2;
            }

            weightedTotal += memberElo * weight;
            totalWeight += weight;
        }

        if (totalWeight <= 0) {
            return club.getElo() != null ? club.getElo() : 1000;
        }

        return (int) Math.round(weightedTotal / totalWeight);
    }

    public int mapSportLevelToElo(SportLevel level) {
        return UserSport.mapSeedElo(level);
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
