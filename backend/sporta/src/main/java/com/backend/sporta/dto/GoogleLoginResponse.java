package com.backend.sporta.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleLoginResponse {
    @com.fasterxml.jackson.annotation.JsonProperty("isNewUser")
    private boolean isNewUser;
    
    private String registrationToken;
    private String accessToken;
    private String email;
    private String fullName;
    private String message;
    private boolean mustChangePassword;
}
