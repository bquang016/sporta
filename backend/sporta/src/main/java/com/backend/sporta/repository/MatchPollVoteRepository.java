package com.backend.sporta.repository;

import com.backend.sporta.entity.MatchPollVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatchPollVoteRepository extends JpaRepository<MatchPollVote, Long> {

    List<MatchPollVote> findByPollId(Long pollId);

    Optional<MatchPollVote> findByPollIdAndUserId(Long pollId, Long userId);

    long countByPollIdAndIsAttendingTrue(Long pollId);
}
