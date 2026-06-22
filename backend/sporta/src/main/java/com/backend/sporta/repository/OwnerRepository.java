package com.backend.sporta.repository;

import com.backend.sporta.entity.Owner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OwnerRepository extends JpaRepository<Owner, UUID> {
    Optional<Owner> findByUserId(Long userId);
    Optional<Owner> findByUserEmail(String email);
}
