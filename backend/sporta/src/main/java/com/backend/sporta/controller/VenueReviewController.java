package com.backend.sporta.controller;

import com.backend.sporta.dto.*;
import com.backend.sporta.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VenueReviewController {

    private final ReviewService reviewService;

    /**
     * POST /api/v1/reviews
     * User tạo đánh giá mới cho venue.
     */
    @PostMapping("/api/v1/reviews")
    public ResponseEntity<VenueReviewResponse> createReview(
            @Valid @RequestBody CreateReviewRequest request) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(reviewService.createReview(request, userEmail));
    }

    /**
     * GET /api/v1/public/venues/{venueId}/reviews?page=0&size=10
     * Lấy danh sách reviews của venue (public — không cần đăng nhập).
     * Nếu có token hợp lệ, trả về thêm canReview và hasReviewed.
     */
    @GetMapping("/api/v1/public/venues/{venueId}/reviews")
    public ResponseEntity<VenueReviewPageResponse> getVenueReviews(
            @PathVariable UUID venueId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String userEmail = null;
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null && !auth.getName().equals("anonymousUser")) {
                userEmail = auth.getName();
            }
        } catch (Exception ignored) { }

        return ResponseEntity.ok(reviewService.getVenueReviews(venueId, page, size, userEmail));
    }

    /**
     * GET /api/v1/venues/{venueId}/reviews/can-review
     * Kiểm tra user đang đăng nhập có thể review venue này không.
     */
    @GetMapping("/api/v1/venues/{venueId}/reviews/can-review")
    public ResponseEntity<Map<String, Boolean>> canReview(@PathVariable UUID venueId) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        boolean result = reviewService.canUserReview(venueId, userEmail);
        return ResponseEntity.ok(Map.of("canReview", result));
    }

    /**
     * POST /api/v1/owner/reviews/{reviewId}/reply
     * Owner phản hồi một review thuộc venue của mình (chỉ 1 lần).
     */
    @PostMapping("/api/v1/owner/reviews/{reviewId}/reply")
    public ResponseEntity<VenueReviewResponse> replyToReview(
            @PathVariable UUID reviewId,
            @Valid @RequestBody OwnerReplyRequest request) {
        String ownerEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(reviewService.replyToReview(reviewId, request, ownerEmail));
    }
}
