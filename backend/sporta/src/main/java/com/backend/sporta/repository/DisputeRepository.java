package com.backend.sporta.repository;

import com.backend.sporta.entity.Dispute;
import com.backend.sporta.enums.DisputeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DisputeRepository extends JpaRepository<Dispute, UUID> {

    List<Dispute> findByMatchId(UUID matchId);

    Optional<Dispute> findByMatchIdAndStatusIn(UUID matchId, List<DisputeStatus> statuses);

    List<Dispute> findByStatus(DisputeStatus status);
}
