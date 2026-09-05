package com.backend.sporta.dto;

import com.backend.sporta.enums.TeamSide;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignTeamRequest {
    private UUID ticketId;
    private TeamSide team;
}
