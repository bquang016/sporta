package com.backend.sporta.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplyPricingRequest {

    @NotEmpty(message = "Danh sách recommendationIds không được để trống")
    private List<UUID> recommendationIds;

    /**
     * Tùy chọn: Nếu chủ sân điều chỉnh lại giá trước khi bấm áp dụng.
     * Key: recommendationId, Value: giá tiền mới muốn áp dụng
     */
    private Map<UUID, Double> customPrices;
}
