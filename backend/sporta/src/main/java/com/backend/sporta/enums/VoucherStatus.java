package com.backend.sporta.enums;

public enum VoucherStatus {
    ACTIVE,    // Đang hoạt động
    DISABLED,  // Đã vô hiệu hóa (chủ sân/admin dừng mã)
    EXPIRED    // Đã hết hạn (tự động bởi scheduler)
}
