package com.backend.sporta.enums;

public enum SupportTicketStatus {
    NEW("Mới tiếp nhận"),
    IN_PROGRESS("Đang xử lý"),
    PENDING_CUSTOMER("Chờ phản hồi"),
    RESOLVED("Đã giải quyết"),
    CLOSED("Đã đóng"),
    REJECTED("Đã từ chối / Hủy"),

    // Backward compatibility
    PENDING("Chờ tiếp nhận"),
    APPROVED("Đã duyệt");

    private final String label;

    SupportTicketStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return this.label != null ? this.label : this.name();
    }
}
