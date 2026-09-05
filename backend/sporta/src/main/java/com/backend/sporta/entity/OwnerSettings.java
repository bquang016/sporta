package com.backend.sporta.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "owner_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnerSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", unique = true, nullable = false)
    private Owner owner;

    // ── 1. Thông báo & Cảnh báo ──
    @Column(name = "notify_new_booking", nullable = false)
    @Builder.Default
    private Boolean notifyNewBooking = true;

    @Column(name = "notify_cancellation", nullable = false)
    @Builder.Default
    private Boolean notifyCancellation = true;

    @Column(name = "notify_on_scan", nullable = false)
    @Builder.Default
    private Boolean notifyOnScan = true;

    @Column(name = "daily_revenue_report", nullable = false)
    @Builder.Default
    private Boolean dailyRevenueReport = true;

    // ── 2. Bảo mật & Phiên làm việc ──
    @Column(name = "require_otp_withdrawal", nullable = false)
    @Builder.Default
    private Boolean requireOtpWithdrawal = false;

    @Column(name = "session_timeout_minutes", nullable = false)
    @Builder.Default
    private Integer sessionTimeoutMinutes = 30; // 15, 30, 60, 0 (0 = Disabled)

    // ── 3. Giao diện & Trải nghiệm ──
    @Column(name = "default_booking_view", nullable = false, length = 20)
    @Builder.Default
    private String defaultBookingView = "grid"; // "grid" | "list"

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.notifyNewBooking == null) this.notifyNewBooking = true;
        if (this.notifyCancellation == null) this.notifyCancellation = true;
        if (this.notifyOnScan == null) this.notifyOnScan = true;
        if (this.dailyRevenueReport == null) this.dailyRevenueReport = true;
        if (this.requireOtpWithdrawal == null) this.requireOtpWithdrawal = false;
        if (this.sessionTimeoutMinutes == null) this.sessionTimeoutMinutes = 30;
        if (this.defaultBookingView == null) this.defaultBookingView = "grid";
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
