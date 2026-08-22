package com.backend.sporta.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenueReviewResponse {

    private UUID id;

    /** Thông tin người review */
    private Long reviewerUserId;
    private String reviewerName;
    private String reviewerAvatar;

    /** Nội dung đánh giá */
    private Integer rating;
    private String comment;

    /** Phản hồi từ chủ sân */
    private String ownerReply;
    private LocalDateTime ownerRepliedAt;

    private LocalDateTime createdAt;

    /**
     * Các điểm tiêu chí phụ được tính tự động từ điểm tổng.
     * Không lưu trong DB — chỉ hiển thị trên UI.
     */
    private Double surfaceScore;   // Mặt sân
    private Double lightingScore;  // Ánh sáng
    private Double serviceScore;   // Dịch vụ
}
