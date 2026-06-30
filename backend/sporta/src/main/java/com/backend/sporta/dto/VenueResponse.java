package com.backend.sporta.dto;

import com.backend.sporta.enums.ApprovalStatus;
import com.backend.sporta.enums.VenueStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class VenueResponse {
    private UUID id;
    private String name;
    private String location;
    private Double latitude;
    private Double longitude;
    private String description;
    
    private LocalTime openingTime;
    private LocalTime closingTime;
    private Integer shiftDurationMinutes;
    
    private String coverImage;
    private List<String> detailImages;
    
    private Boolean hasSurcharge;
    private Double surchargeAmount;
    private String surchargeDescription;
    
    private VenueStatus status;
    private ApprovalStatus approvalStatus;
    private Boolean hasPendingRevision;
}