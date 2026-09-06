package com.backend.sporta.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubMemberResponse {
    private Long id;
    private Long userId;
    private String name;
    private String fullName;
    private String role; // "Trưởng nhóm", "Phó nhóm", "Thành viên"
    private Integer elo;
    private com.backend.sporta.enums.EloStatus eloStatus;
    private String levelLabel;
    private String avatar;
    private String avatarUrl;
    private String status; // "PENDING", "APPROVED", "REJECTED"
    private String joinedAt;
}
