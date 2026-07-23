package com.backend.sporta.dto.matchmaking;

import lombok.Data;
import java.util.List;

@Data
public class ReportMatchResultRequest {
    private Long matchRoomId;
    private Long clubId;
    private Integer ourGoals;
    private Integer opponentGoals;
    private String evidenceImageUrl;
    private List<Long> playerUserIds; // Các cầu thủ ra sân của CLB
}
