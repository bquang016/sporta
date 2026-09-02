package com.backend.sporta.entity;

import com.backend.sporta.enums.DiscountType;
import com.backend.sporta.enums.VoucherScope;
import com.backend.sporta.enums.VoucherStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "vouchers", indexes = {
    @Index(name = "idx_voucher_code", columnList = "code", unique = true),
    @Index(name = "idx_voucher_owner", columnList = "owner_id"),
    @Index(name = "idx_voucher_scope", columnList = "voucher_scope"),
    @Index(name = "idx_voucher_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Voucher {

    @Id
    @GeneratedValue
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "UUID")
    private UUID id;

    /** Tên hiển thị của mã khuyến mãi */
    @Column(name = "name", nullable = false)
    private String name;

    /** Mã khuyến mãi (unique, uppercase, VD: "SPORTA50K") */
    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    /** Loại giảm giá: PERCENTAGE hoặc FIXED_AMOUNT */
    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false, length = 20)
    private DiscountType discountType;

    /** Giá trị giảm (% hoặc VND tùy discountType) */
    @Column(name = "discount_value", nullable = false)
    private Double discountValue;

    /** Giảm tối đa (chỉ áp dụng cho PERCENTAGE, nullable cho FIXED_AMOUNT) */
    @Column(name = "max_discount_amount")
    private Double maxDiscountAmount;

    /** Giá trị đơn hàng tối thiểu để áp dụng voucher */
    @Column(name = "min_order_amount")
    @Builder.Default
    private Double minOrderAmount = 0.0;

    /** Giới hạn sử dụng tối đa trên mỗi người dùng */
    @Column(name = "max_usage_per_user")
    @Builder.Default
    private Integer maxUsagePerUser = 1;

    /** Ngày/giờ bắt đầu hiệu lực */
    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    /** Ngày/giờ hết hạn */
    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    /** Tổng số mã phát hành */
    @Column(name = "total_quantity", nullable = false)
    private Integer totalQuantity;

    /** Số mã đã được thu thập */
    @Column(name = "collected_quantity")
    @Builder.Default
    private Integer collectedQuantity = 0;

    /** Số mã đã được sử dụng */
    @Column(name = "used_quantity")
    @Builder.Default
    private Integer usedQuantity = 0;

    /** Phạm vi: SYSTEM (toàn hệ thống) hoặc VENUE (cụm sân cụ thể) */
    @Enumerated(EnumType.STRING)
    @Column(name = "voucher_scope", nullable = false, length = 10)
    private VoucherScope voucherScope;

    /** Trạng thái: ACTIVE, DISABLED, EXPIRED */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 10)
    @Builder.Default
    private VoucherStatus status = VoucherStatus.ACTIVE;

    /** URL ảnh banner (chỉ dùng cho voucher SYSTEM, nullable) */
    @Column(name = "banner_image_url", columnDefinition = "TEXT")
    private String bannerImageUrl;

    /** Owner tạo voucher (nullable — null cho voucher SYSTEM do Admin tạo) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private Owner owner;

    /** Danh sách cụm sân áp dụng (nếu owner chọn "cụm sân cụ thể") */
    @OneToMany(mappedBy = "voucher", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<VoucherVenue> applicableVenues = new ArrayList<>();

    @Column(name = "is_push_sent")
    @Builder.Default
    private Boolean isPushSent = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.code != null) {
            this.code = this.code.toUpperCase();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ── Computed helpers ──

    /** Số lượng mã còn lại có thể sử dụng */
    public int getRemainingQuantity() {
        return Math.max(0, totalQuantity - usedQuantity);
    }

    /** Tỷ lệ sử dụng (%) */
    public double getUsageRate() {
        if (totalQuantity == 0) return 0;
        return (double) usedQuantity / totalQuantity * 100;
    }

    /** Tỷ lệ chuyển đổi: sử dụng / thu thập (%) */
    public double getConversionRate() {
        if (collectedQuantity == 0) return 0;
        return (double) usedQuantity / collectedQuantity * 100;
    }

    /** Kiểm tra voucher có đang còn hiệu lực không (dựa trên lượt sử dụng) */
    public boolean isCurrentlyValid() {
        LocalDateTime now = LocalDateTime.now();
        return status == VoucherStatus.ACTIVE
                && now.isBefore(endDate)
                && usedQuantity < totalQuantity;
    }
}
