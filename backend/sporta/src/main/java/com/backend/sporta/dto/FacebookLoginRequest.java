package com.backend.sporta.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FacebookLoginRequest {
    @NotBlank(message = "Access token Facebook không được để trống")
    private String accessToken;
}
