package com.backend.sporta.enums;

public enum PaymentTransactionStatus {
    PENDING,      // Đang chờ thanh toán
    COMPLETED,    // Đã thanh toán thành công
    FAILED,       // Thanh toán thất bại
    CANCELLED     // Đã hủy
}
