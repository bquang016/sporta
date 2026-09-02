package com.backend.sporta.repository;

import com.backend.sporta.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;
import java.util.UUID;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, UUID> {
    List<Ticket> findBySessionId(UUID sessionId);
    Optional<Ticket> findBySessionIdAndUserId(UUID sessionId, Long userId);
    Optional<Ticket> findFirstBySessionIdAndIsCaptainTrue(UUID sessionId);
    Optional<Ticket> findByShortCode(String shortCode);
    boolean existsByShortCode(String shortCode);
    
    @Query("SELECT t FROM Ticket t JOIN FETCH t.session s JOIN FETCH s.venue v JOIN FETCH s.court c WHERE t.user.id = :userId ORDER BY t.createdAt DESC")
    List<Ticket> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    @Query("SELECT t FROM Ticket t JOIN FETCH t.session s JOIN FETCH s.venue v JOIN FETCH s.court c WHERE t.user.email = :email ORDER BY t.createdAt DESC")
    List<Ticket> findByUserEmailOrderByCreatedAtDesc(@Param("email") String email);
}
