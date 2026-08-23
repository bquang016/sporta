package com.backend.sporta.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DeviceTokenRequest {
    @NotBlank(message = "Token is required")
    private String token;
    
    private String deviceType;
}
