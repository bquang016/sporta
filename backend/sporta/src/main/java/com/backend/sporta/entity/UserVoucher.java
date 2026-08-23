package com.backend.sporta.entity;

import com.backend.sporta.enums.UserVoucherStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_vouchers", uniqueConstraints = {
    @UniqueConstraint(name = "uk_user_voucher", columnNames = {"user_id", "voucher_id"})
}, indexes = {
    @Index(name = "idx_uv_user_status", columnList = "user_id, status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserVoucher {

    @Id
    @GeneratedValue
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "UUID")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voucher_id", nullable = false)
    private Voucher voucher;

    /** Trạng thái: COLLECTED, USED, EXPIRED */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 15)
    @Builder.Default
    private UserVoucherStatus status = UserVoucherStatus.COLLECTED;

    /** Thời điểm thu thập voucher */
    @Column(name = "collected_at")
    private LocalDateTime collectedAt;

    /** Thời điểm sử dụng voucher */
    @Column(name = "used_at")
    private LocalDateTime usedAt;

    /** Cooldown: không được dùng lại voucher này trước thời điểm này (chống abuse khi hủy đơn hoàn voucher) */
    @Column(name = "cooldown_until")
    private LocalDateTime cooldownUntil;

    @PrePersist
    protected void onCreate() {
        if (this.collectedAt == null) {
            this.collectedAt = LocalDateTime.now();
        }
    }
}
