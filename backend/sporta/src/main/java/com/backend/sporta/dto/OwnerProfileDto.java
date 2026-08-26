package com.backend.sporta.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerProfileDto {
    private String name;
    private String email;
    private String phone;
    private String role;
    private UUID venueId;
    private String facilityName;
    private String address;
    private String openHours;
    private String description;
    private String avatarUrl;
}
