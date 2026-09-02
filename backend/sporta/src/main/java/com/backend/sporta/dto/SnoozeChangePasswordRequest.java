package com.backend.sporta.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SnoozeChangePasswordRequest {
    @NotNull(message = "Số ngày nhắc lại không được để trống")
    private Integer snoozeDays; // 1 or 3
}
