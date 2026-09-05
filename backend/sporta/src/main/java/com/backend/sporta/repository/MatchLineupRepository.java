package com.backend.sporta.repository;

import com.backend.sporta.entity.MatchLineup;
import com.backend.sporta.enums.LineupStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MatchLineupRepository extends JpaRepository<MatchLineup, Long> {

    List<MatchLineup> findByClubIdOrderByCreatedAtDesc(Long clubId);

    List<MatchLineup> findByClubIdAndStatusOrderByCreatedAtDesc(Long clubId, LineupStatus status);

    List<MatchLineup> findBySourcePollId(Long pollId);

    Optional<MatchLineup> findByMatchRoomIdAndTeamSide(UUID matchRoomId, com.backend.sporta.enums.TeamSide teamSide);

    List<MatchLineup> findByMatchRoomId(UUID matchRoomId);

    long countByClubId(Long clubId);
}
