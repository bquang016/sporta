package com.backend.sporta.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WalletPayBookingRequest {

    @NotNull(message = "Danh sách khung giờ không được để trống")
    private List<BookingSlotRequest> slots;
}
