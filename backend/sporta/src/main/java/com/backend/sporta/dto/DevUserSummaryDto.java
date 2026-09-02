package com.backend.sporta.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DevUserSummaryDto {
    private Long id;
    private String fullName;
    private String email;
    private String avatarUrl;
    private String role;
    private Integer elo;
    private String level;
}
