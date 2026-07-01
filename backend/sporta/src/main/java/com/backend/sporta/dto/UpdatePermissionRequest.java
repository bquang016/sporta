package com.backend.sporta.dto;

import lombok.Data;

@Data
public class UpdatePermissionRequest {
    private String feature;
    private boolean isAllowed;
}
