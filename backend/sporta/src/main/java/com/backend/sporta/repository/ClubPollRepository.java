package com.backend.sporta.repository;

import com.backend.sporta.entity.ClubPoll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClubPollRepository extends JpaRepository<ClubPoll, Long> {

    Optional<ClubPoll> findFirstByClubIdAndIsClosedFalseOrderByCreatedAtDesc(Long clubId);

    List<ClubPoll> findByClubIdOrderByCreatedAtDesc(Long clubId);

    Optional<ClubPoll> findByClubIdAndMatchId(Long clubId, java.util.UUID matchId);
}
