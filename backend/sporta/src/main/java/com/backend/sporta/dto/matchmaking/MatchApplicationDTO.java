package com.backend.sporta.dto.matchmaking;

import com.backend.sporta.enums.MatchApplicationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MatchApplicationDTO {
    private Long id;
    private Long matchRoomId;
    private Long applicantClubId;
    private String applicantClubName;
    private String applicantClubAvatar;
    private Integer applicantClubCrp;
    private Long applicantUserId;
    private String applicantUserName;
    private MatchApplicationStatus status;
    private LocalDateTime createdAt;
}
