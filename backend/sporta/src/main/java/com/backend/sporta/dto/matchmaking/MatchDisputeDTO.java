package com.backend.sporta.dto.matchmaking;

import com.backend.sporta.enums.MatchDisputeStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchDisputeDTO {
    private Long id;
    private Long matchRoomId;
    private String creatorClubName;
    private String matchedClubName;
    private String sportName;
    private String venueName;
    private String courtName;
    private String teamAEvidence;
    private String teamBEvidence;
    private LocalDateTime deadline;
    private MatchDisputeStatus status;
    private Long penaltyClubId;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;
}
