package com.backend.sporta.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateBankAccountRequest {
    @NotBlank(message = "Bank code cannot be blank")
    private String bankCode;

    @NotBlank(message = "Bank name cannot be blank")
    private String bankName;

    private String bankLogo;

    @NotBlank(message = "Account number cannot be blank")
    private String accountNumber;

    @NotBlank(message = "Account name cannot be blank")
    private String accountName;
}
