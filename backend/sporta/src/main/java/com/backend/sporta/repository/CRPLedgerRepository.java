package com.backend.sporta.repository;

import com.backend.sporta.entity.CRPLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CRPLedgerRepository extends JpaRepository<CRPLedger, UUID> {

    Optional<CRPLedger> findByMatchIdAndClubId(UUID matchId, Long clubId);

    List<CRPLedger> findByMatchId(UUID matchId);

    List<CRPLedger> findByClubIdOrderByCreatedAtDesc(Long clubId);
}
