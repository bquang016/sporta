package com.backend.sporta.dto;

import com.backend.sporta.enums.LineupStatus;
import com.backend.sporta.enums.LineupType;
import com.backend.sporta.enums.TeamSide;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LineupResponse {
    private Long id;
    private Long clubId;
    private String clubName;
    private Long sourcePollId;
    private String name; // e.g. "GT-A-1", "Nội bộ Đội A"
    private Integer eloAvg;
    private LineupType lineupType;
    private LineupStatus status;
    private String matchRoomId;
    private TeamSide teamSide;
    private List<LineupMemberDto> members;
    private Integer memberCount;
    private String createdAt;
}
