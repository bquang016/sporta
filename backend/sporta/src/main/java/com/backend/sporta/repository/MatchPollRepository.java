package com.backend.sporta.repository;

import com.backend.sporta.entity.MatchPoll;
import com.backend.sporta.enums.PollStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchPollRepository extends JpaRepository<MatchPoll, Long> {

    List<MatchPoll> findByClubIdOrderByCreatedAtDesc(Long clubId);

    List<MatchPoll> findByClubIdAndStatusOrderByCreatedAtDesc(Long clubId, PollStatus status);

    long countByClubId(Long clubId);
}
