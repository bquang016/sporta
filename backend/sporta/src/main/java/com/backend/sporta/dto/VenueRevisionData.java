package com.backend.sporta.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenueRevisionData {
    private String name;
    private String location;
    private String province;
    private String district;
    private String ward;
    private String addressDetail;
    private Double latitude;
    private Double longitude;
}
