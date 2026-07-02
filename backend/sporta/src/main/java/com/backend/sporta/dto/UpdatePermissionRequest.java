package com.backend.sporta.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class UpdatePermissionRequest {
    private String feature;
    
    @JsonProperty("isAllowed")
    private boolean isAllowed;
}
