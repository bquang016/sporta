package com.backend.sporta.repository;

import com.backend.sporta.entity.Venue;
import com.backend.sporta.enums.ApprovalStatus;
import com.backend.sporta.enums.VenueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VenueRepository extends JpaRepository<Venue, UUID>, JpaSpecificationExecutor<Venue> {
    List<Venue> findByOwnerUserEmail(String email);
    List<Venue> findByStatusAndApprovalStatus(VenueStatus status, ApprovalStatus approvalStatus);
    List<Venue> findByStatusAndApprovalStatusAndSportId(VenueStatus status, ApprovalStatus approvalStatus, Long sportId);

    @Query("SELECT v FROM Venue v WHERE v.status = :status AND v.approvalStatus = :approvalStatus " +
           "AND (:sportId IS NULL OR v.sport.id = :sportId) " +
           "AND v.latitude BETWEEN :minLat AND :maxLat AND v.longitude BETWEEN :minLng AND :maxLng")
    List<Venue> findInBoundingBox(
            @Param("status") VenueStatus status,
            @Param("approvalStatus") ApprovalStatus approvalStatus,
            @Param("sportId") Long sportId,
            @Param("minLat") Double minLat,
            @Param("maxLat") Double maxLat,
            @Param("minLng") Double minLng,
            @Param("maxLng") Double maxLng
    );

    @Query("SELECT b.venue.id, COUNT(b) FROM Booking b WHERE b.venue.id IN :venueIds AND b.status = com.backend.sporta.enums.BookingStatus.CONFIRMED GROUP BY b.venue.id")
    List<Object[]> countConfirmedBookingsByVenueIds(@Param("venueIds") List<UUID> venueIds);
}
