package com.backend.sporta.repository;

import com.backend.sporta.entity.MatchResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MatchResultRepository extends JpaRepository<MatchResult, UUID> {

    Optional<MatchResult> findFirstByMatchIdOrderByConfirmedAtDesc(UUID matchId);

    default Optional<MatchResult> findByMatchId(UUID matchId) {
        return findFirstByMatchIdOrderByConfirmedAtDesc(matchId);
    }
}
