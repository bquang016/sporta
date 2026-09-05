package com.backend.sporta.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VenuePolicyResponse {
    private Integer freeCancellationHours;
    private Integer lateCancellationRefundRate;
    private Boolean rainRescheduleAllowed;
}
