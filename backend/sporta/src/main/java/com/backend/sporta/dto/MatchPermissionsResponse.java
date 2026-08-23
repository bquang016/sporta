package com.backend.sporta.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchPermissionsResponse {
    private Boolean canCreateRoom;
    private Boolean canSuggest;
    private Boolean canRequestJoin;
    private Boolean canWithdrawRequest;
    private Boolean canManageApplicants;
    private Boolean canEditRoom;
    private Boolean canCancelRoom;
    private Boolean canEnterScore;
    private Boolean canConfirmScore;
    private Boolean canReport;
    private Boolean canProposeDraw;
}
