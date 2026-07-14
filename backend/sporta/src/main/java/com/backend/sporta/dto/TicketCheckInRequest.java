package com.backend.sporta.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketCheckInRequest {
    @NotBlank(message = "Mã QR code token không được để trống")
    private String token;
}
