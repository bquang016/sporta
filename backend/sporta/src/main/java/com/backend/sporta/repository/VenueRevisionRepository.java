package com.backend.sporta.repository;

import com.backend.sporta.entity.VenueRevision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;

@Repository
public interface VenueRevisionRepository extends JpaRepository<VenueRevision, UUID> {
    List<VenueRevision> findByVenueIdOrderByCreatedAtDesc(UUID venueId);
}