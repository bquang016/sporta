package com.backend.sporta.repository;

import com.backend.sporta.entity.ScoreSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ScoreSubmissionRepository extends JpaRepository<ScoreSubmission, UUID> {

    List<ScoreSubmission> findByMatchIdOrderByVersionDesc(UUID matchId);

    Optional<ScoreSubmission> findFirstByMatchIdOrderByVersionDesc(UUID matchId);
}
