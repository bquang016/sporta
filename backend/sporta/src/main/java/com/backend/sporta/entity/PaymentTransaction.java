package com.backend.sporta.entity;

import com.backend.sporta.enums.PaymentTransactionStatus;
import com.backend.sporta.enums.PaymentTransactionType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payment_transactions", indexes = {
    @Index(name = "idx_payment_txn_order_code", columnList = "order_code", unique = true),
    @Index(name = "idx_payment_txn_user_id", columnList = "user_id"),
    @Index(name = "idx_payment_txn_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTransaction {

    @Id
    @GeneratedValue
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "UUID")
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    /** PayOS orderCode - dùng làm key đối soát */
    @Column(name = "order_code", nullable = false, unique = true)
    private Long orderCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 30)
    private PaymentTransactionType transactionType;

    /** Số tiền (VNĐ, không thập phân) */
    @Column(name = "amount", nullable = false)
    private Long amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private PaymentTransactionStatus status = PaymentTransactionStatus.PENDING;

    /** Loại đối tượng tham chiếu (vd: "BOOKING") - nullable */
    @Column(name = "reference_type", length = 30)
    private String referenceType;

    /** ID đối tượng tham chiếu (vd: booking_id) - nullable */
    @Column(name = "reference_id")
    private UUID referenceId;

    @Column(name = "payos_checkout_url", columnDefinition = "TEXT")
    private String payosCheckoutUrl;

    @Column(name = "payos_qr_code", columnDefinition = "TEXT")
    private String payosQrCode;

    @Column(name = "description")
    private String description;

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
