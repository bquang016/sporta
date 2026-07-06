package com.backend.sporta.repository;

import com.backend.sporta.entity.CourtPriceRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CourtPriceRuleRepository extends JpaRepository<CourtPriceRule, UUID> {
    List<CourtPriceRule> findByCourtId(UUID courtId);
    void deleteByCourtId(UUID courtId);
}
