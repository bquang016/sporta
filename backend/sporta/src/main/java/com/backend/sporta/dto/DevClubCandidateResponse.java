package com.backend.sporta.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DevClubCandidateResponse {
    private Long id;
    private String fullName;
    private String email;
    private String avatarUrl;
    private String role;
    private Integer elo;
    private Boolean isDevTester;
}
