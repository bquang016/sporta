package com.backend.sporta.repository;

import com.backend.sporta.entity.WalletTransaction;
import com.backend.sporta.enums.WalletType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, UUID> {

    Page<WalletTransaction> findByWalletTypeAndUserIdOrderByCreatedAtDesc(
            WalletType walletType, Long userId, Pageable pageable);

    Page<WalletTransaction> findByWalletTypeAndOwnerIdOrderByCreatedAtDesc(
            WalletType walletType, UUID ownerId, Pageable pageable);
}
