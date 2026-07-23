package com.backend.sporta.dto.matchmaking;

import lombok.Data;

@Data
public class ResolveDisputeRequest {
    private Long matchRoomId;
    private Long winnerClubId;
    private Long penaltyClubId; // Đội cố tình báo sai kết quả
    private Integer winnerGoals;
    private Integer loserGoals;
    private String adminNote;
}
