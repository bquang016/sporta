package com.backend.sporta.service;

import com.backend.sporta.dto.*;

import java.util.UUID;

public interface ReviewService {

    /**
     * User tạo đánh giá mới cho venue.
     * Điều kiện: User phải có ít nhất 1 Booking COMPLETED tại venue đó.
     * Mỗi User chỉ review 1 lần / 1 venue.
     */
    VenueReviewResponse createReview(CreateReviewRequest request, String userEmail);

    /**
     * Lấy danh sách reviews của venue (phân trang 10 review/page).
     * Trả về thêm canReview và hasReviewed nếu có userEmail.
     */
    VenueReviewPageResponse getVenueReviews(UUID venueId, int page, int size, String userEmail);

    /**
     * Owner phản hồi review (chỉ reply 1 lần).
     * Kiểm tra Owner sở hữu Venue chứa review đó.
     */
    VenueReviewResponse replyToReview(UUID reviewId, OwnerReplyRequest request, String ownerEmail);

    /**
     * Kiểm tra User có thể review venue này không.
     * true nếu: có Booking COMPLETED + chưa review lần nào
     */
    boolean canUserReview(UUID venueId, String userEmail);
}
