package com.backend.sporta.repository;

import com.backend.sporta.entity.LineupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LineupMemberRepository extends JpaRepository<LineupMember, Long> {

    List<LineupMember> findByLineupId(Long lineupId);

    Optional<LineupMember> findByLineupIdAndUserId(Long lineupId, Long userId);

    void deleteByLineupIdAndUserId(Long lineupId, Long userId);

    void deleteByLineupId(Long lineupId);

    @Query("SELECT lm FROM LineupMember lm WHERE lm.user.id = :userId AND lm.lineup.status IN ('ACTIVE', 'IN_MATCH')")
    List<LineupMember> findActiveMembershipsByUserId(@Param("userId") Long userId);
}
