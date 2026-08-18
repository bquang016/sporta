package com.backend.sporta.dto;

import com.backend.sporta.enums.MatchStatus;
import com.backend.sporta.enums.MatchType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchRoomResponse {
    private String id;
    private BookingSummaryResponse booking;
    private ClubSummaryResponse hostClub;
    private ClubSummaryResponse guestClub;
    private MatchType matchType;
    private Integer hostSharePercent;
    private Integer guestSharePercent;
    private Double guestShareAmount;
    private List<String> desiredLevels;
    private String note;
    private MatchStatus status;
    private List<JoinRequestResponse> applicants;
    private JoinRequestResponse myRequest;
    private MatchPermissionsResponse permissions;
    private String createdAt;
    private String balanceLabel;
    private Double distanceKm;
    private ScoreSubmissionResponse scoreSubmission;
    private MatchResultResponse result;
}
