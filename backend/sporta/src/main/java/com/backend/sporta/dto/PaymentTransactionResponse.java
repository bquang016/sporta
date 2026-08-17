package com.backend.sporta.dto;

import com.backend.sporta.enums.PaymentTransactionStatus;
import com.backend.sporta.enums.PaymentTransactionType;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTransactionResponse {

    private UUID id;
    private Long orderCode;
    private PaymentTransactionType transactionType;
    private Long amount;
    private PaymentTransactionStatus status;
    private String referenceType;
    private UUID referenceId;
    private String description;
    private LocalDateTime createdAt;
}
