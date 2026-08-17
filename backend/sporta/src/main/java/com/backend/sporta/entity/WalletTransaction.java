package com.backend.sporta.entity;

import com.backend.sporta.enums.WalletTransactionType;
import com.backend.sporta.enums.WalletType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "wallet_transactions", indexes = {
    @Index(name = "idx_wallet_txn_user_id", columnList = "user_id"),
    @Index(name = "idx_wallet_txn_owner_id", columnList = "owner_id"),
    @Index(name = "idx_wallet_txn_created_at", columnList = "created_at"),
    @Index(name = "idx_wallet_txn_type", columnList = "transaction_type")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletTransaction {

    @Id
    @GeneratedValue
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "UUID")
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "wallet_type", nullable = false, length = 10)
    private WalletType walletType;

    /** User ID - nullable (chỉ có khi walletType = USER) */
    @Column(name = "user_id")
    private Long userId;

    /** Owner ID - nullable (chỉ có khi walletType = OWNER) */
    @Column(name = "owner_id")
    private UUID ownerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 30)
    private WalletTransactionType transactionType;

    /** Số tiền giao dịch (VNĐ, giá trị dương) */
    @Column(name = "amount", nullable = false)
    private Long amount;

    /** Số dư trước giao dịch */
    @Column(name = "balance_before", nullable = false)
    private Long balanceBefore;

    /** Số dư sau giao dịch */
    @Column(name = "balance_after", nullable = false)
    private Long balanceAfter;

    /** ID tham chiếu (booking_id hoặc payment_transaction_id) - nullable */
    @Column(name = "reference_id")
    private UUID referenceId;

    @Column(name = "description")
    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
