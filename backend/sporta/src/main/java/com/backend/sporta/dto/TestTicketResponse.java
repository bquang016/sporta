package com.backend.sporta.dto;

import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestTicketResponse {
    private UUID ticketId;
    private String customerName;
    private String qrCodeToken;
    private String shortCode;
}
