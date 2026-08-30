package com.backend.sporta.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CancellationPreviewResponse {
    private UUID bookingId;
    private String bookingCode;
    private String venueName;
    private String courtName;
    private LocalDateTime startTime;
    private Double hoursRemaining;

    private Double originalPrice;
    private Double finalPaidPrice;
    
    /** Tỷ lệ hoàn tiền áp dụng (%) e.g. 100, 50, 0 */
    private Integer refundRate;
    
    /** Số tiền hoàn lại vào ví Sporta (VNĐ) */
    private Long refundAmount;
    
    /** Phí hủy sân bị khấu trừ (VNĐ) */
    private Long cancellationFee;
    
    /** Mô tả chi tiết chính sách áp dụng */
    private String policyDescription;
    
    /** Đơn hàng có đủ điều kiện hoàn tiền không */
    private Boolean isEligibleForRefund;
    
    /** Nơi tiền hoàn về */
    private String refundDestination;

    /** Có đang trong thời gian ân hạn 10 phút sau khi đặt không */
    private Boolean isGracePeriod;

    /** Số phút còn lại trong thời gian ân hạn 10 phút */
    private Long graceMinutesRemaining;
}
