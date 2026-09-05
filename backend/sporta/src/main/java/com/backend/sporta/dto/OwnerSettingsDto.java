package com.backend.sporta.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerSettingsDto {
    // ── 1. Thông báo & Cảnh báo ──
    @Builder.Default
    private Boolean notifyNewBooking = true;

    @Builder.Default
    private Boolean notifyCancellation = true;

    @Builder.Default
    private Boolean notifyOnScan = true;

    @Builder.Default
    private Boolean dailyRevenueReport = true;

    // ── 2. Bảo mật & Phiên làm việc ──
    @Builder.Default
    private Boolean requireOtpWithdrawal = false;

    @Builder.Default
    private Integer sessionTimeoutMinutes = 30; // 15, 30, 60, 0 (0 = Disabled)

    // ── 3. Giao diện & Trải nghiệm ──
    @Builder.Default
    private String defaultBookingView = "grid"; // "grid" | "list"
}
