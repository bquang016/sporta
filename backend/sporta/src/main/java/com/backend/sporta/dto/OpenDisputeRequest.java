package com.backend.sporta.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OpenDisputeRequest {
    @NotBlank(message = "Reason code is required")
    private String reasonCode;

    private String description;
}
