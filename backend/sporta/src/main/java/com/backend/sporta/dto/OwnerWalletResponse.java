package com.backend.sporta.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnerWalletResponse {

    private Long balance;
    private Long totalEarned;
    private Long totalCommission;
    private String formattedBalance;
    private String formattedTotalEarned;
    private String formattedTotalCommission;
}
