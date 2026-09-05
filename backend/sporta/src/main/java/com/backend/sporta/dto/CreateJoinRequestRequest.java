package com.backend.sporta.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateJoinRequestRequest {
    @NotNull(message = "Applicant Club ID is required")
    private Long applicantClubId;

    private String note;

    private Long lineupId;
}
