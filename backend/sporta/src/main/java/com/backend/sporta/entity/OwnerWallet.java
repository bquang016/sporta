package com.backend.sporta.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "owner_wallets", indexes = {
    @Index(name = "idx_owner_wallet_owner_id", columnList = "owner_id", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnerWallet {

    @Id
    @GeneratedValue
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "UUID")
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", unique = true, nullable = false)
    private Owner owner;

    /** Số dư khả dụng (VNĐ) */
    @Column(name = "balance", nullable = false)
    @Builder.Default
    private Long balance = 0L;

    /** Tổng doanh thu lũy kế */
    @Column(name = "total_earned", nullable = false)
    @Builder.Default
    private Long totalEarned = 0L;

    /** Tổng chiết khấu nền tảng đã trừ */
    @Column(name = "total_commission", nullable = false)
    @Builder.Default
    private Long totalCommission = 0L;

    /** Optimistic locking */
    @Version
    @Column(name = "version")
    private Long version;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
