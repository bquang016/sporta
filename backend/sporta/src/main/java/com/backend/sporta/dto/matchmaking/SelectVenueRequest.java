package com.backend.sporta.dto.matchmaking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SelectVenueRequest {
    private String courtId;
    private String courtName;
    private String venueName;
    private BigDecimal hourlyPrice;
}
