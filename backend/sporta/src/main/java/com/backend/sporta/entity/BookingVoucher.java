package com.backend.sporta.entity;

import com.backend.sporta.enums.VoucherScope;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "booking_vouchers", indexes = {
    @Index(name = "idx_bv_booking", columnList = "booking_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingVoucher {

    @Id
    @GeneratedValue
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "UUID")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voucher_id", nullable = false)
    private Voucher voucher;

    /** Scope để phân bổ chi phí khi đối soát: VENUE → trừ doanh thu owner, SYSTEM → trừ hoa hồng platform */
    @Enumerated(EnumType.STRING)
    @Column(name = "voucher_scope", nullable = false, length = 10)
    private VoucherScope voucherScope;

    /** Số tiền đã giảm cho booking này */
    @Column(name = "discount_applied", nullable = false)
    private Double discountApplied;
}
