package com.backend.sporta.dto;

import com.backend.sporta.enums.PriceRuleType;
import lombok.*;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourtPriceRuleRequest {
    private PriceRuleType ruleType;
    private LocalTime startTime;
    private LocalTime endTime;
    private Double customPrice;
    private Integer dayOfWeek; // 1-7 (1=Thứ 2, 7=Chủ Nhật)
    private Double percentageModifier;
    private Double fixedModifier;
}
