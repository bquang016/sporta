package com.backend.sporta.repository;

import com.backend.sporta.entity.LockReason;
import com.backend.sporta.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LockReasonRepository extends JpaRepository<LockReason, Long> {
    List<LockReason> findByRole(Role role);
}
