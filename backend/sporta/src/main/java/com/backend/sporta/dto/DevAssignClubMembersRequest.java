package com.backend.sporta.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DevAssignClubMembersRequest {
    private List<Long> userIds;
}
