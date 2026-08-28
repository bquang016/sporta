package com.backend.sporta.repository;

import com.backend.sporta.entity.TicketSession;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface TicketSessionRepository extends JpaRepository<TicketSession, UUID> {

    @Query("SELECT ts FROM TicketSession ts " +
           "WHERE ts.venue.id = :venueId " +
           "AND ts.playDate = :date " +
           "ORDER BY ts.startTime ASC")
    List<TicketSession> findByVenueIdAndPlayDate(@Param("venueId") UUID venueId, @Param("date") LocalDate date);

    @Query("SELECT ts FROM TicketSession ts " +
           "JOIN ts.venue v " +
           "JOIN v.owner o " +
           "JOIN o.user u " +
           "WHERE u.email = :email " +
           "AND ts.playDate = :date " +
           "ORDER BY ts.startTime ASC")
    List<TicketSession> findByOwnerEmailAndPlayDate(@Param("email") String email, @Param("date") LocalDate date);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT ts FROM TicketSession ts WHERE ts.id = :id")
    java.util.Optional<TicketSession> findByIdWithLock(@Param("id") UUID id);

    @Query("SELECT ts FROM TicketSession ts " +
           "JOIN FETCH ts.venue v " +
           "JOIN FETCH ts.court c " +
           "WHERE ts.status = 'OPEN' " +
           "AND ts.playDate >= :today " +
           "AND (:sportLevel IS NULL OR ts.sportLevel = :sportLevel) " +
           "ORDER BY ts.playDate ASC, ts.startTime ASC")
    List<TicketSession> findAvailableSessions(@Param("today") LocalDate today, 
                                              @Param("sportLevel") com.backend.sporta.enums.SportLevel sportLevel);
}
