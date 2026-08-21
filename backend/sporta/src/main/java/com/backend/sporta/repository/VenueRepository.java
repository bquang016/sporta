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

    @Query("SELECT v FROM Venue v WHERE v.status = :status AND v.approvalStatus = :approvalStatus " +
           "AND v.latitude BETWEEN :minLat AND :maxLat AND v.longitude BETWEEN :minLng AND :maxLng")
    List<Venue> findInBoundingBox(
            @Param("status") VenueStatus status,
            @Param("approvalStatus") ApprovalStatus approvalStatus,
            @Param("minLat") Double minLat,
            @Param("maxLat") Double maxLat,
            @Param("minLng") Double minLng,
            @Param("maxLng") Double maxLng
    );

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.venue.id = :venueId AND b.status = com.backend.sporta.enums.BookingStatus.CONFIRMED")
    Long countConfirmedBookingsByVenueId(@Param("venueId") UUID venueId);
}
