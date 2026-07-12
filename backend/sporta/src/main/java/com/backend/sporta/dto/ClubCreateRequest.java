package com.backend.sporta.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubCreateRequest {

    @NotBlank(message = "Tên câu lạc bộ không được để trống")
    private String name;

    private String description;
    private String avatarImage;
    private String coverImage;
    private Boolean isPrivate;
    private String activityLevel;
    private String area;
    private Integer maxMembers;

    @NotNull(message = "Môn thể thao không được để trống")
    private Long sportId;
}
