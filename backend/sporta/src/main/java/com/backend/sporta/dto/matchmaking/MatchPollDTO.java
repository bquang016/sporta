package com.backend.sporta.dto.matchmaking;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MatchPollDTO {
    private Long id;
    private Long matchRoomId;
    private Long clubId;
    private Integer requiredVotes;
    private Integer currentYesVotes;
    private Boolean isUnlocked;
    private Boolean userVotedYes;
    private LocalDateTime createdAt;
}
