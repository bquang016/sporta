package com.backend.sporta.dto;

import com.backend.sporta.enums.SportLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSportDto {
    private Long id;
    private Long sportId;
    private String sportName;
    private String sportIcon;
    private SportLevel level;
}
