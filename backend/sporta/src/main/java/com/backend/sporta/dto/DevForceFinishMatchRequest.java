package com.backend.sporta.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DevForceFinishMatchRequest {
    @NotBlank(message = "Tỷ số host không được để trống")
    private String hostScore;

    @NotBlank(message = "Tỷ số guest không được để trống")
    private String guestScore;

    private String rawScoreDetails;

    private java.util.List<Long> hostPlayerUserIds;
    private java.util.List<Long> guestPlayerUserIds;
}
