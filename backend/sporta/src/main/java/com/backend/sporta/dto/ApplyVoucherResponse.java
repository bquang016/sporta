package com.backend.sporta.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplyVoucherResponse {

    /** Số tiền giảm từ voucher cụm sân */
    @Builder.Default
    private Double ownerDiscount = 0.0;

    /** Số tiền giảm từ voucher hệ thống */
    @Builder.Default
    private Double systemDiscount = 0.0;

    /** Tổng giảm (có thể bị cap ở 80% giá gốc) */
    @Builder.Default
    private Double totalDiscount = 0.0;

    /** Giá cuối cùng sau giảm */
    private Double finalPrice;

    /** Tổng giảm có bị cap ở 80% không */
    @Builder.Default
    private Boolean cappedAt80 = false;

    /** Thông báo / cảnh báo (VD: "Tổng giảm đã được giới hạn ở 80% giá gốc") */
    @Builder.Default
    private List<String> messages = new ArrayList<>();
}
