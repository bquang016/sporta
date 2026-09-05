package com.backend.sporta.repository;

import com.backend.sporta.entity.PollVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PollVoteRepository extends JpaRepository<PollVote, Long> {

    List<PollVote> findByPollId(Long pollId);

    List<PollVote> findByPollIdAndUserId(Long pollId, Long userId);

    Optional<PollVote> findByPollIdAndUserIdAndOptionId(Long pollId, Long userId, Long optionId);

    long countByPollIdAndOptionId(Long pollId, Long optionId);

    void deleteByPollId(Long pollId);

    void deleteByPollIdAndUserId(Long pollId, Long userId);

    void deleteByPollIdAndUserIdAndOptionId(Long pollId, Long userId, Long optionId);
}
