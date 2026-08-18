package com.backend.sporta.repository;

import com.backend.sporta.entity.MatchRoom;
import com.backend.sporta.enums.MatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MatchRoomRepository extends JpaRepository<MatchRoom, UUID> {

    List<MatchRoom> findByBookingIdAndStatusIn(UUID bookingId, List<MatchStatus> statuses);

    boolean existsByBookingIdAndStatusIn(UUID bookingId, List<MatchStatus> statuses);

    List<MatchRoom> findByStatusAndJoinDeadlineBefore(MatchStatus status, LocalDateTime deadline);

    @Query("SELECT r FROM MatchRoom r WHERE (:sportId IS NULL OR r.hostClub.sport.id = :sportId) AND (:status IS NULL OR r.status = :status) ORDER BY r.createdAt DESC")
    List<MatchRoom> findAllByFilters(@Param("sportId") Long sportId, @Param("status") MatchStatus status);

    List<MatchRoom> findByHostClubIdInOrGuestClubIdInOrderByCreatedAtDesc(List<Long> hostClubIds, List<Long> guestClubIds);
}
