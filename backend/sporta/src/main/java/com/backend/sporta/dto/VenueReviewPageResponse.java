package com.backend.sporta.dto;

import lombok.*;

import java.util.List;

/**
 * Wrapper phân trang cho danh sách review.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenueReviewPageResponse {
    private List<VenueReviewResponse> reviews;
    private long totalReviews;
    private double averageRating;
    private int page;
    private int size;
    private boolean hasMore;

    /** Điểm trung bình các tiêu chí phụ (tính từ tất cả reviews) */
    private double avgSurfaceScore;
    private double avgLightingScore;
    private double avgServiceScore;

    /** Có thể review không (cho user đang đăng nhập) */
    private Boolean canReview;
    private Boolean hasReviewed;
    private VenueReviewResponse myReview;
}
