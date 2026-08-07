package com.backend.sporta.repository;

import com.backend.sporta.entity.OwnerWallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OwnerWalletRepository extends JpaRepository<OwnerWallet, UUID> {

    Optional<OwnerWallet> findByOwnerId(UUID ownerId);

    boolean existsByOwnerId(UUID ownerId);
}
