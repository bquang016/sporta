package com.backend.sporta.repository;

import com.backend.sporta.entity.Court;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;

@Repository
public interface CourtRepository extends JpaRepository<Court, UUID> {
    List<Court> findByVenueOwnerId(UUID ownerId);
    List<Court> findByVenueOwnerUserEmail(String email);
    List<Court> findByVenueId(UUID venueId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Court c WHERE c.id = :id")
    Optional<Court> findByIdWithLock(@Param("id") UUID id);

    @Query("SELECT MIN(c.price) FROM Court c WHERE c.venue.id = :venueId AND c.status = com.backend.sporta.enums.CourtStatus.ACTIVE")
    Double findMinPriceByVenueIdAndStatusActive(@Param("venueId") UUID venueId);

    @Query("SELECT MAX(c.price) FROM Court c WHERE c.venue.id = :venueId AND c.status = com.backend.sporta.enums.CourtStatus.ACTIVE")
    Double findMaxPriceByVenueIdAndStatusActive(@Param("venueId") UUID venueId);
}

