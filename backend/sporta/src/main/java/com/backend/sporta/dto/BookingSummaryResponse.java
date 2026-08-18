package com.backend.sporta.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingSummaryResponse {
    private String id;
    private String facilityName;
    private String courtName;
    private String sportId;
    private String sportName;
    private String date;
    private String startTime;
    private String endTime;
    private Double totalPrice;
    private Boolean isPaid;
    private String format;
    private String address;
}
