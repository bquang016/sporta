package com.backend.sporta.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DevAssignVotesRequest {
    private List<Long> userIds;
    private Long optionId;
    private Boolean clearExisting;
}
