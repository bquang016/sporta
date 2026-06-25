package com.backend.sporta.repository;

import com.backend.sporta.entity.VenueAmenity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface VenueAmenityRepository extends JpaRepository<VenueAmenity, UUID> {
}
