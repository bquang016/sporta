package com.backend.sporta.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatePaymentResponse {

    private Long orderCode;
    private String checkoutUrl;
    private String qrCode;
    private Long amount;
    private String description;
}
