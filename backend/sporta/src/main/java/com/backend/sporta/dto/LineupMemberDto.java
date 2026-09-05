package com.backend.sporta.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LineupMemberDto {
    private Long userId;
    private String fullName;
    private String avatarUrl;
    private Integer elo;
    private String role; // "Trưởng CLB", "Phó CLB", "Thành viên"
    private String addedAt;
}
