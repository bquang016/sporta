package com.backend.sporta.enums;

public enum SupportTicketStatus {
    NEW,               // Mới tiếp nhận
    IN_PROGRESS,       // Đang xử lý
    PENDING_CUSTOMER,  // Chờ người dùng phản hồi
    ESCALATED,         // Đang chuyển tiếp / Chờ bên thứ ba
    RESOLVED,          // Đã giải quyết
    CLOSED,            // Đã đóng
    REJECTED,          // Đã hủy / Từ chối

    // Trạng thái cũ (Dành cho backward compatibility với dữ liệu cũ trong database)
    PENDING,
    APPROVED
}
