package com.backend.sporta.repository;

import com.backend.sporta.entity.MatchPoll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MatchPollRepository extends JpaRepository<MatchPoll, Long> {

    Optional<MatchPoll> findByMatchRoomIdAndClubId(Long matchRoomId, Long clubId);
}
