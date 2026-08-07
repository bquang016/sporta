package com.backend.sporta.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BankAccountResponse {
    private UUID id;
    private String bankCode;
    private String bankName;
    private String bankLogo;
    private String accountNumber;
    private String accountName;
    private Boolean isDefault;
    private LocalDateTime createdAt;
}
