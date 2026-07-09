package com.backend.sporta.repository;

import com.backend.sporta.entity.LockLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface LockLogRepository extends JpaRepository<LockLog, Long> {
    Optional<LockLog> findFirstByUserIdAndActionOrderByCreatedAtDesc(Long userId, String action);
}
