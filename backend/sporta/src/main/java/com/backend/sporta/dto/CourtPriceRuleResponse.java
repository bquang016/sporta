package com.backend.sporta.dto;

import com.backend.sporta.enums.PriceRuleType;
import lombok.*;
import java.time.LocalTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourtPriceRuleResponse {
    private UUID id;
    private UUID courtId;
    private PriceRuleType ruleType;
    private LocalTime startTime;
    private LocalTime endTime;
    private Double customPrice;
    private Integer dayOfWeek;
    private Double percentageModifier;
    private Double fixedModifier;
}
