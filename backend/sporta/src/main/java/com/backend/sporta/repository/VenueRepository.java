package com.backend.sporta.repository;

import com.backend.sporta.entity.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VenueRepository extends JpaRepository<Venue, UUID> {
    List<Venue> findByOwnerUserEmail(String email);
    List<Venue> findByStatusAndApprovalStatus(com.backend.sporta.enums.VenueStatus status, com.backend.sporta.enums.ApprovalStatus approvalStatus);
}
