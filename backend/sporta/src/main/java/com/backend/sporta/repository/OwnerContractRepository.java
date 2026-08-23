package com.backend.sporta.repository;

import com.backend.sporta.entity.OwnerContract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OwnerContractRepository extends JpaRepository<OwnerContract, Long> {
    List<OwnerContract> findByOwnerId(UUID ownerId);
    boolean existsByVenueId(UUID venueId);
}
