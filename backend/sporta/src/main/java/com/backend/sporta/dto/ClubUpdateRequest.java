package com.backend.sporta.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubUpdateRequest {
    private String name;
    private String description;
    private String avatarImage;
    private String coverImage;
    private Boolean isPrivate;
    private String activityLevel;
    private String area;
    private Integer maxMembers;
    private Integer elo;
    private Integer minEloRequired;
}
