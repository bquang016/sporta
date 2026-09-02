package com.backend.sporta.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String message;
    private boolean mustChangePassword;
    private String passwordSnoozeUntil; // ISO-8601 string, null if no active snooze
    private List<String> permissions;
}
