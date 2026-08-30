package com.backend.sporta.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseTicketRequest {
    @Builder.Default
    private int quantity = 1;
    
    @Builder.Default
    private String paymentMethod = "payos"; // "wallet", "payos", "cash", "dev"
    
    private String ownerVoucherCode;
    private String systemVoucherCode;
}
