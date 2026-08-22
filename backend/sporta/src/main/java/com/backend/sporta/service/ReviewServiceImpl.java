package com.backend.sporta.service;

import com.backend.sporta.dto.*;
import com.backend.sporta.entity.*;
import com.backend.sporta.enums.BookingStatus;
import com.backend.sporta.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final VenueReviewRepository reviewRepository;
    private final VenueRepository venueRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    // ─────────────────────────────────────────────────────────────────────────
    // Tạo đánh giá mới
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public VenueReviewResponse createReview(CreateReviewRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng: " + userEmail));

        Venue venue = venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cụm sân với ID: " + request.getVenueId()));

        // Kiểm tra điều kiện: phải có Booking COMPLETED tại venue này
        boolean hasCompletedBooking = bookingRepository.existsByUserIdAndVenueIdAndStatus(
                user.getId(), venue.getId(), BookingStatus.COMPLETED);
        if (!hasCompletedBooking) {
            throw new RuntimeException("Bạn chỉ có thể đánh giá sau khi đã hoàn thành buổi chơi tại cụm sân này.");
        }

        // Kiểm tra đã review chưa (1 user chỉ review 1 lần / venue)
        boolean alreadyReviewed = reviewRepository.findByVenueIdAndUserId(venue.getId(), user.getId()).isPresent();
        if (alreadyReviewed) {
            throw new RuntimeException("Bạn đã đánh giá cụm sân này rồi. Mỗi người chỉ được đánh giá 1 lần.");
        }

        // Lưu review
        VenueReview review = VenueReview.builder()
                .venue(venue)
                .user(user)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();
        VenueReview saved = reviewRepository.save(review);

        // Cập nhật điểm trung bình trên Venue
        recalculateVenueRating(venue);

        return mapToResponse(saved);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Lấy danh sách reviews (phân trang)
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public VenueReviewPageResponse getVenueReviews(UUID venueId, int page, int size, String userEmail) {
        // Validate venue tồn tại
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cụm sân với ID: " + venueId));

        Page<VenueReview> pageResult = reviewRepository.findByVenueIdAndIsDeletedFalseOrderByCreatedAtDesc(
                venueId, PageRequest.of(page, size));

        List<VenueReviewResponse> reviews = pageResult.getContent()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        double avg = venue.getAverageRating() != null ? venue.getAverageRating() : 0.0;

        // Tính điểm tiêu chí phụ tổng hợp (cùng công thức với từng review)
        double avgSurface  = calcSurfaceScore(avg);
        double avgLighting = calcLightingScore(avg);
        double avgService  = calcServiceScore(avg);

        // Thông tin canReview / hasReviewed nếu có user
        Boolean canReview = null;
        Boolean hasReviewed = null;
        if (userEmail != null && !userEmail.isBlank()) {
            User user = userRepository.findByEmail(userEmail).orElse(null);
            if (user != null) {
                hasReviewed = reviewRepository.findByVenueIdAndUserId(venueId, user.getId()).isPresent();
                if (!hasReviewed) {
                    canReview = bookingRepository.existsByUserIdAndVenueIdAndStatus(
                            user.getId(), venueId, BookingStatus.COMPLETED);
                } else {
                    canReview = false;
                }
            }
        }

        return VenueReviewPageResponse.builder()
                .reviews(reviews)
                .totalReviews(pageResult.getTotalElements())
                .averageRating(avg)
                .page(page)
                .size(size)
                .hasMore(pageResult.hasNext())
                .avgSurfaceScore(avgSurface)
                .avgLightingScore(avgLighting)
                .avgServiceScore(avgService)
                .canReview(canReview)
                .hasReviewed(hasReviewed)
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Owner phản hồi review
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public VenueReviewResponse replyToReview(UUID reviewId, OwnerReplyRequest request, String ownerEmail) {
        VenueReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá với ID: " + reviewId));

        if (review.getIsDeleted()) {
            throw new RuntimeException("Đánh giá này đã bị xóa.");
        }

        // Kiểm tra Owner có quyền reply: Owner của venue chứa review
        Venue venue = review.getVenue();
        if (!venue.getOwner().getUser().getEmail().equals(ownerEmail)) {
            throw new RuntimeException("Bạn không có quyền phản hồi đánh giá này.");
        }

        // Chỉ được reply 1 lần
        if (review.getOwnerReply() != null && !review.getOwnerReply().isBlank()) {
            throw new RuntimeException("Bạn đã phản hồi đánh giá này rồi. Mỗi đánh giá chỉ được phản hồi 1 lần.");
        }

        review.setOwnerReply(request.getReply());
        review.setOwnerRepliedAt(LocalDateTime.now());
        VenueReview updated = reviewRepository.save(review);

        return mapToResponse(updated);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Kiểm tra quyền review
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public boolean canUserReview(UUID venueId, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user == null) return false;

        boolean hasReviewed = reviewRepository.findByVenueIdAndUserId(venueId, user.getId()).isPresent();
        if (hasReviewed) return false;

        return bookingRepository.existsByUserIdAndVenueIdAndStatus(
                user.getId(), venueId, BookingStatus.COMPLETED);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    /** Tính lại averageRating và totalReviews trên Venue sau mỗi thao tác */
    private void recalculateVenueRating(Venue venue) {
        double avg = reviewRepository.calculateAverageRatingByVenueId(venue.getId());
        long total = reviewRepository.countByVenueIdAndIsDeletedFalse(venue.getId());

        // Làm tròn 1 chữ số thập phân
        venue.setAverageRating(Math.round(avg * 10.0) / 10.0);
        venue.setTotalReviews((int) total);
        venueRepository.save(venue);
    }

    /** Map entity → DTO */
    private VenueReviewResponse mapToResponse(VenueReview review) {
        User reviewer = review.getUser();
        int rating = review.getRating();

        return VenueReviewResponse.builder()
                .id(review.getId())
                .reviewerUserId(reviewer != null ? reviewer.getId() : null)
                .reviewerName(reviewer != null ? reviewer.getFullName() : "Người dùng ẩn danh")
                .reviewerAvatar(reviewer != null ? reviewer.getAvatarUrl() : null)
                .rating(rating)
                .comment(review.getComment())
                .ownerReply(review.getOwnerReply())
                .ownerRepliedAt(review.getOwnerRepliedAt())
                .createdAt(review.getCreatedAt())
                // Tiêu chí phụ tính tự động
                .surfaceScore(calcSurfaceScore(rating))
                .lightingScore(calcLightingScore(rating))
                .serviceScore(calcServiceScore(rating))
                .build();
    }

    /**
     * Công thức tính tiêu chí phụ từ điểm tổng.
     * Tạo cảm giác chi tiết nhưng không lưu DB.
     */
    private double calcSurfaceScore(double rating) {
        return Math.min(5.0, Math.round(rating * 1.02 * 10.0) / 10.0);
    }

    private double calcLightingScore(double rating) {
        return Math.min(5.0, Math.round(rating * 0.97 * 10.0) / 10.0);
    }

    private double calcServiceScore(double rating) {
        return Math.min(5.0, Math.round(rating * 1.00 * 10.0) / 10.0);
    }
}
