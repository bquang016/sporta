package com.backend.sporta.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubResponse {
    private Long id;
    private String name;
    private String description;
    private String avatarImage;
    private String coverImage;
    private Boolean isPrivate;
    private String activityLevel;
    private String area;
    private Integer members;
    private Integer maxMembers;
    private Integer elo;
    private String sport;
    private Long sportId;
    private String sportIcon;
    private Long creatorId;
    private String creatorName;
    private String userStatus; // "NOT_MEMBER", "PENDING", "MEMBER", "SUB_LEADER", "ADMIN"
}
