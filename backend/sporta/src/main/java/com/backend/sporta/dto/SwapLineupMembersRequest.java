package com.backend.sporta.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SwapLineupMembersRequest {
    @NotNull
    private Long sourceLineupId;
    @NotNull
    private Long targetLineupId;
    @NotNull
    private Long userIdA; // Player from sourceLineup
    @NotNull
    private Long userIdB; // Player from targetLineup
}
