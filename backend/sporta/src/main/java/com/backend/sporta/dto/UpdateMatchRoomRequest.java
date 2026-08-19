package com.backend.sporta.dto;

import lombok.Data;
import java.util.List;

@Data
public class UpdateMatchRoomRequest {
    private List<String> desiredLevels;
    private String note;
    private Integer hostSharePercent;
}
