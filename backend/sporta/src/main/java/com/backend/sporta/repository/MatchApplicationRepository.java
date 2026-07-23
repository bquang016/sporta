package com.backend.sporta.repository;

import com.backend.sporta.entity.MatchApplication;
import com.backend.sporta.enums.MatchApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatchApplicationRepository extends JpaRepository<MatchApplication, Long> {

    List<MatchApplication> findByMatchRoomId(Long matchRoomId);

    List<MatchApplication> findByMatchRoomIdAndStatus(Long matchRoomId, MatchApplicationStatus status);

    Optional<MatchApplication> findByMatchRoomIdAndApplicantClubId(Long matchRoomId, Long applicantClubId);
}
