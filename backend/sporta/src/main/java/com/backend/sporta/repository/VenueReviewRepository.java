package com.backend.sporta.repository;

import com.backend.sporta.entity.VenueReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface VenueReviewRepository extends JpaRepository<VenueReview, UUID> {

    /** Lấy review mới nhất của 1 user cho 1 venue */
    Optional<VenueReview> findFirstByVenueIdAndUserIdAndIsDeletedFalseOrderByCreatedAtDesc(UUID venueId, Long userId);

    /** Danh sách review hiển thị của venue (phân trang, chỉ lấy chưa bị xóa) */
    Page<VenueReview> findByVenueIdAndIsDeletedFalseOrderByCreatedAtDesc(UUID venueId, Pageable pageable);

    /** Tổng số review của venue */
    long countByVenueIdAndIsDeletedFalse(UUID venueId);

    /** Tính điểm trung bình */
    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM VenueReview r WHERE r.venue.id = :venueId AND r.isDeleted = false")
    double calculateAverageRatingByVenueId(@Param("venueId") UUID venueId);
}
