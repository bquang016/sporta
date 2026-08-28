package com.backend.sporta.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RejectPricingRequest {

    @NotEmpty(message = "Danh sách recommendationIds không được để trống")
    private List<UUID> recommendationIds;

    private String reason;
}
