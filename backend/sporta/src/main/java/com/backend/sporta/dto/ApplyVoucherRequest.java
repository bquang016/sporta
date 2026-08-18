package com.backend.sporta.dto;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApplyVoucherRequest {

    /** Mã voucher cụm sân (nullable) */
    private String ownerVoucherCode;

    /** Mã voucher hệ thống (nullable) */
    private String systemVoucherCode;

    /** ID cụm sân đang đặt (để validate voucher VENUE) */
    private UUID venueId;

    /** Tổng giá đơn hàng (để validate minOrderAmount) */
    private Double totalPrice;
}
