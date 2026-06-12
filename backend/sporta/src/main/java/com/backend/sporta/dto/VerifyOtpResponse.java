package com.backend.sporta.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerifyOtpResponse {
    private boolean isNewUser;
    
    // Used if user is new, to pass to the registration form
    private String registrationToken;
    
    // Used if user exists, immediately log them in
    private String accessToken;
    
    private String message;
}
