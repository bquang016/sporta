package com.backend.sporta.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisputeDetailResponse {

    private UUID disputeId;
    private UUID matchId;
    private UUID roomId;
    private String status; // OPEN, RESOLVED

    private String reasonCode;
    private String description;

    private Long openedByClubId;
    private String openedByClubName;

    private Long hostClubId;
    private String hostClubName;
    private String hostClubAvatar;

    private Long guestClubId;
    private String guestClubName;
    private String guestClubAvatar;

    private String sportName;
    private String venueName;
    private String matchDate;
    private String matchTime;

    private String hostSubmittedScore;
    private String hostSubmittedRaw;

    private String guestEvidenceImageUrl;
    private String guestEvidenceDescription;
    private LocalDateTime guestEvidenceCreatedAt;

    private String hostEvidenceImageUrl;
    private String hostEvidenceDescription;
    private LocalDateTime hostEvidenceCreatedAt;

    private boolean hostHasSubmittedEvidence;
    private LocalDateTime disputeCreatedAt;
    private LocalDateTime counterEvidenceDeadline; // 24 hours from disputeCreatedAt
    private boolean isDeadlineExpired;

    private String resolutionNote;
    private String resolvedResultJson;
    private LocalDateTime resolvedAt;

    private boolean canSubmitHostEvidence;
    private boolean isDisputeParty; // User is member/admin of Host or Guest club
}
