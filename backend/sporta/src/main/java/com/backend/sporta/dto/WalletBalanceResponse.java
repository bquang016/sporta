package com.backend.sporta.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletBalanceResponse {

    private Long balance;
    private String formattedBalance; // vd: "150,000 VNĐ"
}
