package com.backend.sporta.repository;

import com.backend.sporta.entity.OwnerRegistration;
import com.backend.sporta.enums.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OwnerRegistrationRepository extends JpaRepository<OwnerRegistration, UUID> {
    Optional<OwnerRegistration> findByEmail(String email);
    List<OwnerRegistration> findByStatus(RegistrationStatus status);
    boolean existsByEmailAndStatus(String email, RegistrationStatus status);
}
