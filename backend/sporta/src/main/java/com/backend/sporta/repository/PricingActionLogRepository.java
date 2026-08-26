package com.backend.sporta.repository;

import com.backend.sporta.entity.PricingActionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PricingActionLogRepository extends JpaRepository<PricingActionLog, UUID> {

    @Query("SELECT pal FROM PricingActionLog pal WHERE pal.court.venue.id = :venueId ORDER BY pal.actionTimestamp DESC")
    List<PricingActionLog> findByVenueId(@Param("venueId") UUID venueId);

    @Query("SELECT COUNT(pal) FROM PricingActionLog pal WHERE pal.court.venue.id = :venueId AND pal.actionType = 'APPLY'")
    long countAppliedByVenueId(@Param("venueId") UUID venueId);

    @Query("SELECT COUNT(pal) FROM PricingActionLog pal WHERE pal.court.venue.id = :venueId AND pal.actionType = 'REJECT'")
    long countRejectedByVenueId(@Param("venueId") UUID venueId);
}
