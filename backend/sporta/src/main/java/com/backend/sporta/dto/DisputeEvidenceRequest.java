package com.backend.sporta.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisputeEvidenceRequest {

    @NotBlank(message = "File reference or image URL is required")
    private String fileRef;

    private String description;
}
