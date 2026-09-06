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
    private String role; // "Trưởng câu lạc bộ", "Phó câu lạc bộ", "Thành viên"
    private String roleCode; // "ADMIN", "SUB_LEADER", "MEMBER"
    private Integer elo;
    private com.backend.sporta.enums.EloStatus eloStatus;
    private String levelLabel;
    private String avatar;
    private String avatarUrl;
    private String status; // "PENDING", "APPROVED", "REJECTED"
    private String joinedAt;
}
