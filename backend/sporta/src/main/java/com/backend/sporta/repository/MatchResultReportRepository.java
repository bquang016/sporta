package com.backend.sporta.repository;

import com.backend.sporta.entity.MatchResultReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatchResultReportRepository extends JpaRepository<MatchResultReport, Long> {

    List<MatchResultReport> findByMatchRoomId(Long matchRoomId);

    Optional<MatchResultReport> findByMatchRoomIdAndClubId(Long matchRoomId, Long clubId);
}
