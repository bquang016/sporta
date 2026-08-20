package com.backend.sporta.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO cho cập nhật voucher.
 * Khi voucher đã có user thu thập/sử dụng (Q13):
 * - Được sửa: name, totalQuantity (chỉ tăng), endDate (chỉ kéo dài), bannerImageUrl
 * - Không được sửa: code, discountType, discountValue, maxDiscountAmount, minOrderAmount, venueIds
 * Logic enforce nằm trong VoucherService.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateVoucherRequest {

    private String name;

    private Integer totalQuantity;

    private LocalDateTime endDate;

    /** Chỉ cho phép cập nhật banner (admin) */
    private String bannerImageUrl;
}
