package com.backend.sporta.repository;

import com.backend.sporta.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;
import java.util.UUID;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, UUID> {
    List<Ticket> findBySessionId(UUID sessionId);
    Optional<Ticket> findByShortCode(String shortCode);
    boolean existsByShortCode(String shortCode);
}
