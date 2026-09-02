package com.backend.sporta.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VotePollRequest {
    @NotNull(message = "Lựa chọn biểu quyết không được để trống")
    private Long optionId;
}
