package com.backend.sporta.repository;

import com.backend.sporta.entity.VenuePolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface VenuePolicyRepository extends JpaRepository<VenuePolicy, UUID> {
    Optional<VenuePolicy> findByVenueId(UUID venueId);
}
