package com.backend.sporta.repository;

import com.backend.sporta.entity.WithdrawalRequest;
import com.backend.sporta.enums.WithdrawalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface WithdrawalRequestRepository extends JpaRepository<WithdrawalRequest, UUID> {

    Page<WithdrawalRequest> findByOwnerIdOrderByCreatedAtDesc(UUID ownerId, Pageable pageable);

    Page<WithdrawalRequest> findByStatusOrderByCreatedAtAsc(WithdrawalStatus status, Pageable pageable);

    Page<WithdrawalRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
