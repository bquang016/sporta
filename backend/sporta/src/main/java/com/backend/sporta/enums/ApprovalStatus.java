package com.backend.sporta.enums;

public enum ApprovalStatus {
    DRAFT,      // Bản nháp chưa gửi duyệt
    PENDING,    // Đang chờ Admin duyệt (dành cho bản nháp)
    APPROVED,   // Đã duyệt / Đang hoạt động chuẩn
    REJECTED    // Bị từ chối
}