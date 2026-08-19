package com.backend.sporta.repository;

import com.backend.sporta.entity.Match;
import com.backend.sporta.enums.MatchStatus;
import com.backend.sporta.enums.MatchType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MatchRepository extends JpaRepository<Match, UUID> {

    Optional<Match> findByRoomId(UUID roomId);

    List<Match> findByStatusNotIn(List<MatchStatus> statuses);

    @Query("SELECT COUNT(m) FROM Match m WHERE m.matchType = :matchType AND m.status = 'RESULT_FINAL' AND m.createdAt >= :since AND ((m.hostClub.id = :clubA AND m.guestClub.id = :clubB) OR (m.hostClub.id = :clubB AND m.guestClub.id = :clubA))")
    long countRecentRankedMatchesBetweenClubs(
            @Param("clubA") Long clubA,
            @Param("clubB") Long clubB,
            @Param("matchType") MatchType matchType,
            @Param("since") LocalDateTime since
    );
}
