package com.backend.sporta.repository;

import com.backend.sporta.entity.Court;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CourtRepository extends JpaRepository<Court, UUID> {
    List<Court> findByOwnerId(UUID ownerId);
    List<Court> findByOwnerUserEmail(String email);
}
