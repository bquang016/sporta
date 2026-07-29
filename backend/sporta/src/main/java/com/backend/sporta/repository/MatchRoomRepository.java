package com.backend.sporta.repository;

import com.backend.sporta.entity.MatchRoom;
import com.backend.sporta.enums.MatchRoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MatchRoomRepository extends JpaRepository<MatchRoom, Long> {

    List<MatchRoom> findByStatusOrderByCreatedAtDesc(MatchRoomStatus status);

    @Query("SELECT m FROM MatchRoom m WHERE m.status = :status AND m.ttlExpiresAt <= :now")
    List<MatchRoom> findExpiredHoldRooms(@Param("status") MatchRoomStatus status, @Param("now") LocalDateTime now);

    List<MatchRoom> findByCreatorClubIdOrMatchedClubId(Long clubId1, Long clubId2);

    @Query("SELECT m.booking.id FROM MatchRoom m WHERE m.booking IS NOT NULL AND m.status NOT IN (com.backend.sporta.enums.MatchRoomStatus.CANCELLED, com.backend.sporta.enums.MatchRoomStatus.EXPIRED)")
    List<java.util.UUID> findUsedBookingIds();
}
