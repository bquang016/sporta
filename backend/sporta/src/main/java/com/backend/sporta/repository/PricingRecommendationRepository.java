package com.backend.sporta.repository;

import com.backend.sporta.entity.PricingRecommendation;
import com.backend.sporta.enums.RecommendationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PricingRecommendationRepository extends JpaRepository<PricingRecommendation, UUID> {

    @Query("SELECT pr FROM PricingRecommendation pr WHERE pr.court.venue.id = :venueId AND pr.status = :status ORDER BY pr.dayOfWeek ASC, pr.startTime ASC")
    List<PricingRecommendation> findByVenueIdAndStatus(
            @Param("venueId") UUID venueId,
            @Param("status") RecommendationStatus status
    );

    @Query("SELECT pr FROM PricingRecommendation pr WHERE pr.court.id = :courtId AND pr.status = :status ORDER BY pr.dayOfWeek ASC, pr.startTime ASC")
    List<PricingRecommendation> findByCourtIdAndStatus(
            @Param("courtId") UUID courtId,
            @Param("status") RecommendationStatus status
    );

    @Query("SELECT pr FROM PricingRecommendation pr WHERE pr.court.id = :courtId AND pr.dayOfWeek = :dayOfWeek AND pr.startTime = :startTime AND pr.status = 'PENDING'")
    Optional<PricingRecommendation> findPendingByCourtAndSlot(
            @Param("courtId") UUID courtId,
            @Param("dayOfWeek") Integer dayOfWeek,
            @Param("startTime") LocalTime startTime
    );

    @Modifying
    @Query("UPDATE PricingRecommendation pr SET pr.status = 'EXPIRED' WHERE pr.status = 'PENDING' AND pr.expiresAt <= :now")
    int expireOutdatedRecommendations(@Param("now") LocalDateTime now);

    @Query("SELECT pr FROM PricingRecommendation pr WHERE pr.court.venue.id = :venueId ORDER BY pr.createdAt DESC")
    List<PricingRecommendation> findRecentByVenueId(@Param("venueId") UUID venueId);
}
