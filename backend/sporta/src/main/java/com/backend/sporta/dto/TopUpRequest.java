package com.backend.sporta.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TopUpRequest {

    @NotNull(message = "Số tiền nạp không được để trống")
    @Min(value = 10000, message = "Số tiền nạp tối thiểu là 10,000 VNĐ")
    @Max(value = 10000000, message = "Số tiền nạp tối đa là 10,000,000 VNĐ")
    private Long amount;
}
