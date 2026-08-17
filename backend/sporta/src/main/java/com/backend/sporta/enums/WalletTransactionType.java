package com.backend.sporta.enums;

public enum WalletTransactionType {
    TOP_UP,              // Nạp tiền vào ví
    BOOKING_PAYMENT,     // Trừ tiền khi đặt sân
    BOOKING_REFUND,      // Hoàn tiền khi hủy booking
    BOOKING_EARNING,     // Cộng tiền doanh thu cho Owner
    COMMISSION_DEDUCT,   // Trừ chiết khấu nền tảng
    WITHDRAWAL           // Rút tiền
}
