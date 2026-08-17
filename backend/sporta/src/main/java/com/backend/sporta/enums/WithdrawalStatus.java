package com.backend.sporta.enums;

public enum WithdrawalStatus {
    PENDING,     // Đang chờ Admin duyệt
    APPROVED,    // Admin đã duyệt (đang xử lý chuyển khoản)
    REJECTED,    // Admin từ chối
    COMPLETED    // Đã chuyển khoản xong
}
