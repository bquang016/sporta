package com.backend.sporta.repository;

import com.backend.sporta.entity.MatchDispute;
import com.backend.sporta.enums.MatchDisputeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatchDisputeRepository extends JpaRepository<MatchDispute, Long> {

    Optional<MatchDispute> findByMatchRoomId(Long matchRoomId);

    List<MatchDispute> findByStatus(MatchDisputeStatus status);
}
