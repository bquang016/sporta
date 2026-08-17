package com.backend.sporta.dto;

import com.backend.sporta.enums.WalletTransactionType;
import com.backend.sporta.enums.WalletType;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletTransactionResponse {

    private UUID id;
    private WalletType walletType;
    private WalletTransactionType transactionType;
    private Long amount;
    private Long balanceBefore;
    private Long balanceAfter;
    private UUID referenceId;
    private String description;
    private LocalDateTime createdAt;
}
