package com.backend.sporta.dto;

import com.backend.sporta.enums.BookingStatus;
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

    private BookingStatus status;
    private Boolean isManual;
    private String customerName;

    /** Mã voucher cụm sân (nullable — do owner tạo) */
    private String ownerVoucherCode;

    /** Mã voucher hệ thống (nullable — do admin tạo) */
    private String systemVoucherCode;
}
