package com.backend.sporta.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SubmitScoreRequest {
    @NotBlank(message = "Host score is required")
    private String hostScore;

    @NotBlank(message = "Guest score is required")
    private String guestScore;

    private String rawScoreDetails;
}
