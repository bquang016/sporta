package com.backend.sporta.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CollectVoucherRequest {

    @NotNull(message = "ID voucher không được để trống")
    private UUID voucherId;
}
