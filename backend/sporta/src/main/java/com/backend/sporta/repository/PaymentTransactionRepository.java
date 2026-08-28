package com.backend.sporta.repository;

import com.backend.sporta.entity.PaymentTransaction;
import com.backend.sporta.enums.PaymentTransactionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, UUID> {

    Optional<PaymentTransaction> findByOrderCode(Long orderCode);

    Page<PaymentTransaction> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    boolean existsByOrderCode(Long orderCode);

    Page<PaymentTransaction> findByUserIdAndStatusOrderByCreatedAtDesc(
            Long userId, PaymentTransactionStatus status, Pageable pageable);
}
