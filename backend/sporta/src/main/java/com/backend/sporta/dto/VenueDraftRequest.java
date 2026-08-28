package com.backend.sporta.dto;

import lombok.*;
import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VenueDraftRequest {
    private String name;
    private String location;
    private Double latitude;
    private Double longitude;
    private String description;
    private String province;
    private String district;
    private String ward;
    private String addressDetail;
    private LocalTime openingTime;
    private LocalTime closingTime;
    private Integer shiftDurationMinutes;
    private Long sportId;
    private String coverImage;
    private List<String> detailImages;
    private Boolean hasSurcharge;
    private Double surchargeAmount;
    private String surchargeDescription;
    private Boolean isContractSigned;
    private String signatureTimestamp;
    private String signatureIp;
    private Integer freeCancellationHours;
    private Integer lateCancellationRefundRate;
    private Boolean rainRescheduleAllowed;
    private List<CourtDraftDto> courts;
}
