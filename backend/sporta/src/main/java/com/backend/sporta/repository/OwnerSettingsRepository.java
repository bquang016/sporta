package com.backend.sporta.repository;

import com.backend.sporta.entity.OwnerSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OwnerSettingsRepository extends JpaRepository<OwnerSettings, Long> {
    Optional<OwnerSettings> findByOwnerId(UUID ownerId);
}
