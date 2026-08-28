package com.backend.sporta.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubPollResponse {
    private Long id;
    private String title;
    private String closeTime;
    private Boolean isClosed;
    private List<String> joinedMembers; // List of member names who voted JOIN
    private List<String> absentMembers; // List of member names who voted ABSENT
    private List<PollVoterDto> joinedVoters; // Detailed voter items with avatar, elo, role
    private List<PollVoterDto> absentVoters; // Detailed voter items with avatar, elo, role
    private String userVote; // "join", "absent" or null
    private MatchmadeTeamsResponse matchmadeTeams;
    private Long creatorId;
    private String creatorName;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PollVoterDto {
        private Long userId;
        private String name;
        private String avatar;
        private Integer elo;
        private String role;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MatchmadeTeamsResponse {
        private List<String> teamA;
        private List<String> teamB;
        private List<PollVoterDto> teamAPlayers;
        private List<PollVoterDto> teamBPlayers;
        private Integer teamATotalElo;
        private Integer teamBTotalElo;
    }
}
