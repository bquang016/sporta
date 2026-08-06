package com.backend.sporta.dto.matchmaking;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateMatchRoomRequest {
    private String format;
    private Integer minElo;
    private Integer maxElo;
    private Boolean allowDifferentLevel;
    private String message;
}
