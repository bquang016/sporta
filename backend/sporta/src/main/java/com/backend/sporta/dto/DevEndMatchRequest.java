package com.backend.sporta.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DevEndMatchRequest {
    private Long hostLineupId;
    private Long guestLineupId;

    private List<Long> hostPlayerUserIds;
    private List<Long> guestPlayerUserIds;

    // Optional: if provided, submits this score directly into SCORE_CONFIRMING state for Side B to verify/dispute
    private String hostScore;
    private String guestScore;
    private String rawScoreDetails;
}
