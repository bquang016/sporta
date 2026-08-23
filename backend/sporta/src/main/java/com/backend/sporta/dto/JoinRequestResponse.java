package com.backend.sporta.dto;

import com.backend.sporta.enums.JoinRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JoinRequestResponse {
    private String id;
    private String roomId;
    private ClubSummaryResponse applicantClub;
    private JoinRequestStatus status;
    private String createdAt;
    private String note;
}
