package com.backend.sporta.dto;

import com.backend.sporta.enums.PaymentTransactionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentRequest {

    @NotNull(message = "Số tiền không được để trống")
    @Min(value = 10000, message = "Số tiền tối thiểu là 10,000 VNĐ")
    private Long amount;

    @NotNull(message = "Loại giao dịch không được để trống")
    private PaymentTransactionType transactionType;

    private String description;

    /** Loại tham chiếu (vd: "BOOKING") - optional */
    private String referenceType;

    /** ID tham chiếu - optional */
    private UUID referenceId;
}
