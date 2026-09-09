package com.backend.sporta.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FacebookLoginResponse {
    private boolean isNewUser;
    private String accessToken;
    private String registrationToken;
    private String email;
    private String fullName;
    private String avatarUrl;
    private String message;
    private boolean mustChangePassword;
    private String role;
}
