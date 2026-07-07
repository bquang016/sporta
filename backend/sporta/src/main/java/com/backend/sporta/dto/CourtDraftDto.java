package com.backend.sporta.dto;

import com.backend.sporta.enums.CourtStatus;
import lombok.*;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourtDraftDto {
    private UUID id;
    private String name;
    private Double price;
    private CourtStatus status;
    private List<CourtPriceRuleRequest> priceRules;
}
