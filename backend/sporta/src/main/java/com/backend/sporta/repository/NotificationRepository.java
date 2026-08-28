package com.backend.sporta.repository;

import com.backend.sporta.entity.Notification;
import com.backend.sporta.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    Page<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId, Pageable pageable);
    
    Page<Notification> findByRecipientIdAndRecipientRoleOrderByCreatedAtDesc(Long recipientId, Role recipientRole, Pageable pageable);
    
    long countByRecipientIdAndIsReadFalse(Long recipientId);
    
    long countByRecipientIdAndRecipientRoleAndIsReadFalse(Long recipientId, Role recipientRole);
    
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipientId = :recipientId AND n.isRead = false")
    void markAllAsRead(Long recipientId);
}
