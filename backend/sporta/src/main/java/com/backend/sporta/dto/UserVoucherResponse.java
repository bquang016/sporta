package com.backend.sporta.dto;

import com.backend.sporta.enums.DiscountType;
import com.backend.sporta.enums.UserVoucherStatus;
import com.backend.sporta.enums.VoucherScope;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserVoucherResponse {

    private UUID id;
    private UUID voucherId;
    private String voucherName;
    private String voucherCode;
    private DiscountType discountType;
    private Double discountValue;
    private Double maxDiscountAmount;
    private Double minOrderAmount;
    private VoucherScope voucherScope;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private UserVoucherStatus status;
    private LocalDateTime collectedAt;
    private LocalDateTime usedAt;

    /** Voucher có thể sử dụng được không (kiểm tra hạn, cooldown, status) */
    private Boolean isUsable;

    /** Lý do không thể sử dụng (nếu isUsable = false) */
    private String reasonIfNotUsable;

    /** Danh sách venue IDs áp dụng */
    private List<UUID> venueIds;

    /** Danh sách tên venue áp dụng (cho hiển thị) */
    private List<String> venueNames;

    /** ID của chủ sân tạo mã */
    private UUID ownerId;

    /** Banner URL (cho voucher hệ thống) */
    private String bannerImageUrl;

    private Integer totalQuantity;
    private Integer usedQuantity;
    private Integer remainingQuantity;
}
