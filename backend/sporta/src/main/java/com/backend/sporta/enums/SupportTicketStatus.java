package com.backend.sporta.enums;

public enum SupportTicketStatus {
    NEW,               // Mới tiếp nhận
    IN_PROGRESS,       // Đang xử lý
    PENDING_CUSTOMER,  // Chờ người dùng phản hồi
    RESOLVED,          // Đã giải quyết
    CLOSED,            // Đã đóng
    REJECTED,          // Đã hủy / Từ chối

    // Trạng thái cũ (Dành cho backward compatibility với dữ liệu cũ trong database)
    PENDING,
    APPROVED
}
