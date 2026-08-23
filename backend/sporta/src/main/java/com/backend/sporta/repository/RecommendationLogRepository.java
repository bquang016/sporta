package com.backend.sporta.repository;

import com.backend.sporta.entity.RecommendationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecommendationLogRepository extends JpaRepository<RecommendationLog, Long> {

    List<RecommendationLog> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT r FROM RecommendationLog r WHERE r.venueId = :venueId AND r.userEmail = :userEmail ORDER BY r.createdAt DESC")
    List<RecommendationLog> findLatestByUserAndVenue(@Param("userEmail") String userEmail, @Param("venueId") UUID venueId);

    @Query("SELECT r FROM RecommendationLog r WHERE r.venueId = :venueId ORDER BY r.createdAt DESC")
    List<RecommendationLog> findLatestByVenue(@Param("venueId") UUID venueId);
}
