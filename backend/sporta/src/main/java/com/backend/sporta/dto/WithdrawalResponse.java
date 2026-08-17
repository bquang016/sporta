package com.backend.sporta.dto;

import com.backend.sporta.enums.WithdrawalStatus;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WithdrawalResponse {

    private UUID id;
    private UUID ownerId;
    private String ownerName;
    private Long amount;
    private String formattedAmount;
    private String bankCode;
    private String bankAccountNumber;
    private String bankAccountName;
    private WithdrawalStatus status;
    private String adminNote;
    private LocalDateTime processedAt;
    private LocalDateTime createdAt;
    private String transferProofUrl;
}
