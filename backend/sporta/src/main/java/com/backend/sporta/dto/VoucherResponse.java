package com.backend.sporta.dto;

import com.backend.sporta.enums.DiscountType;
import com.backend.sporta.enums.VoucherScope;
import com.backend.sporta.enums.VoucherStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherResponse {

    private UUID id;
    private String name;
    private String code;
    private DiscountType discountType;
    private Double discountValue;
    private Double maxDiscountAmount;
    private Double minOrderAmount;
    private Integer maxUsagePerUser;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer totalQuantity;
    private Integer collectedQuantity;
    private Integer usedQuantity;
    private VoucherScope voucherScope;
    private VoucherStatus status;
    private String bannerImageUrl;
    private UUID ownerId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ── Computed fields ──

    /** Số lượng mã còn lại */
    private Integer remainingQuantity;

    /** Tỷ lệ sử dụng (%) */
    private Double usageRate;

    /** Tỷ lệ chuyển đổi: sử dụng / thu thập (%) — metric Q12 */
    private Double conversionRate;

    /** Voucher đã hết hạn chưa */
    private Boolean isExpired;

    /** Danh sách venue IDs áp dụng (null = tất cả) */
    private List<UUID> venueIds;

    /** Danh sách tên venue áp dụng (cho hiển thị UI) */
    private List<String> venueNames;
}
