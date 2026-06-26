package com.backend.sporta.repository;

import com.backend.sporta.entity.CourtPricing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CourtPricingRepository extends JpaRepository<CourtPricing, UUID> {
}
