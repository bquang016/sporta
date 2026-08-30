package com.backend.sporta.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CancelBookingRequest {
    /** Lý do hủy: e.g. "Bận việc đột xuất", "Thời tiết xấu", "Đổi kế hoạch", "Khác" */
    private String reason;
    
    /** Ghi chú chi tiết thêm */
    private String note;
}
