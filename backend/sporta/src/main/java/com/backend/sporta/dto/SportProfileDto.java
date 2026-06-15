package com.backend.sporta.dto;

import com.backend.sporta.entity.SportLevel;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SportProfileDto {
    @NotNull(message = "Sport ID is required")
    private Long sportId;

    @NotNull(message = "Sport level is required")
    private SportLevel level;
}
