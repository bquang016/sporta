package com.backend.sporta.enums;

public enum BookingStatus {
    PENDING,     // Đang chờ xác nhận / chờ thanh toán
    CONFIRMED,   // Đã xác nhận thành công
    CANCELLED,   // Đã hủy
    COMPLETED    // Đã chơi xong
}
