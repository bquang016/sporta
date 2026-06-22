package com.backend.sporta.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleLoginRequest {
    @NotBlank(message = "Id token không được để trống")
    private String idToken;
}
