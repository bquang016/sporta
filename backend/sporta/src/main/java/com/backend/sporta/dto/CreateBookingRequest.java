package com.backend.sporta.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateBookingRequest {

    @NotNull(message = "Danh sách khung giờ không được để trống")
    private java.util.List<BookingSlotRequest> slots;

    /** momo | vnpay | card | bank */
    private String paymentMethod;
}
