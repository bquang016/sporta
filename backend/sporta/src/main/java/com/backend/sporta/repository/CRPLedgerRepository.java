package com.backend.sporta.repository;

import com.backend.sporta.entity.CRPLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CRPLedgerRepository extends JpaRepository<CRPLedger, UUID> {

    Optional<CRPLedger> findFirstByMatchIdAndClubIdOrderByCreatedAtDesc(UUID matchId, Long clubId);

    default Optional<CRPLedger> findByMatchIdAndClubId(UUID matchId, Long clubId) {
        return findFirstByMatchIdAndClubIdOrderByCreatedAtDesc(matchId, clubId);
    }

    List<CRPLedger> findByMatchId(UUID matchId);

    List<CRPLedger> findByClubIdOrderByCreatedAtDesc(Long clubId);

    List<CRPLedger> findTop10ByClubIdOrderByCreatedAtDesc(Long clubId);

    long countByClubIdAndCreatedAtGreaterThanEqual(Long clubId, java.time.LocalDateTime since);
}
