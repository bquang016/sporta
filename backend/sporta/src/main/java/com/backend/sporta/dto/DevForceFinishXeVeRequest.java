package com.backend.sporta.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DevForceFinishXeVeRequest {
    private String hostScore;
    private String guestScore;
    private String rawScoreDetails;
    private List<Long> hostUserIds;
    private List<Long> guestUserIds;
}
