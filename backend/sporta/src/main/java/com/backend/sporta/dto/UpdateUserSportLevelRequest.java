package com.backend.sporta.dto;

import com.backend.sporta.enums.SportLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserSportLevelRequest {
    private Long sportId;
    private SportLevel level;
}
