package com.backend.sporta.repository;

import com.backend.sporta.entity.ClubPollVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClubPollVoteRepository extends JpaRepository<ClubPollVote, Long> {

    List<ClubPollVote> findByPollId(Long pollId);

    Optional<ClubPollVote> findByPollIdAndUserId(Long pollId, Long userId);

    void deleteByPollId(Long pollId);
}
