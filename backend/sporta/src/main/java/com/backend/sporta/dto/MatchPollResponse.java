package com.backend.sporta.dto;

import com.backend.sporta.enums.PollStatus;
import com.backend.sporta.enums.PollType;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchPollResponse {
    private Long id;
    private Long clubId;
    private String clubName;
    private Long creatorId;
    private String creatorName;
    private String creatorAvatar;
    private String title;
    private PollType pollType;
    private String deadline;
    private Integer maxPlayers;
    private Integer minPlayers;
    private PollStatus status;
    private List<PollOptionDto> options;
    private Long myVoteOptionId;
    private Integer totalVotes;
    private Integer joinVotesCount;
    private List<LineupResponse> lineups;
    private Boolean canManage;
    private String createdAt;
    private String closedAt;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PollOptionDto {
        private Long id;
        private String label;
        private Boolean isJoinOption;
        private Boolean isDefault;
        private Integer displayOrder;
        private Integer voteCount;
        private List<PollVoterDto> voters;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PollVoterDto {
        private Long userId;
        private String fullName;
        private String avatarUrl;
        private Integer elo;
        private String role;
        private String votedAt;
    }
}
