package com.backend.sporta.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenueSearchCriteriaDTO {
    private String keyword;
    private List<Long> sportIds;
    private String province;
    private String district;
    private Double minPrice;
    private Double maxPrice;
    
    // Level 2: LBS
    private Double userLat;
    private Double userLng;
    private Double radiusKm;
    
    // Level 2: Availability
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
}
