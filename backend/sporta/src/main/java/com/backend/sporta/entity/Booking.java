package com.backend.sporta.entity;

import com.backend.sporta.enums.BookingStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id", nullable = false)
    private Venue venue;

    @Column(name = "total_price", nullable = false)
    private Double totalPrice;

    @Column(name = "discount_amount")
    @Builder.Default
    private Double discountAmount = 0.0;

    @Column(name = "final_price", nullable = false)
    private Double finalPrice;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<BookingDetail> details;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<BookingVoucher> appliedVouchers;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private BookingStatus status = BookingStatus.CONFIRMED;

    @Column(name = "is_manual")
    @Builder.Default
    private Boolean isManual = false;

    @Column(name = "customer_name")
    private String customerName;

    @Column(name = "customer_phone", length = 20)
    private String customerPhone;

    /** Mã đặt sân định danh hiển thị cho người dùng, e.g. "SP-A3K9-X2" */
    @Column(name = "booking_code", nullable = false, unique = true, length = 20)
    private String bookingCode;

    /** Phương thức thanh toán: WALLET | PAYOS | CASH */
    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    /** Số tiền được giảm khi thanh toán bằng ví (VNĐ) */
    @Column(name = "wallet_discount_amount")
    @Builder.Default
    private Long walletDiscountAmount = 0L;

    /** Số tiền đã hoàn lại vào ví người dùng khi hủy sân (VNĐ) */
    @Column(name = "refund_amount")
    private Double refundAmount;

    /** Tỷ lệ hoàn tiền (%) e.g. 100, 50, 0 */
    @Column(name = "refund_rate")
    private Integer refundRate;

    /** Lý do hủy sân */
    @Column(name = "cancellation_reason", length = 500)
    private String cancellationReason;

    /** Thời điểm hủy đơn */
    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

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
