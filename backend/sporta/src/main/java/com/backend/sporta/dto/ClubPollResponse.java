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
    private String userVote; // "join", "absent" or null
    private MatchmadeTeamsResponse matchmadeTeams;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MatchmadeTeamsResponse {
        private List<String> teamA;
        private List<String> teamB;
    }
}
