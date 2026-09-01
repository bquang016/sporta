package com.backend.sporta.repository;

import com.backend.sporta.entity.Notification;
import com.backend.sporta.enums.NotificationType;
import com.backend.sporta.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    Page<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId, Pageable pageable);
    
    Page<Notification> findByRecipientIdAndRecipientRoleOrderByCreatedAtDesc(Long recipientId, Role recipientRole, Pageable pageable);

    // Social notification queries
    Page<Notification> findByRecipientIdAndTypeInOrderByCreatedAtDesc(Long recipientId, Collection<NotificationType> types, Pageable pageable);

    // System (non-social) notification queries
    Page<Notification> findByRecipientIdAndTypeNotInOrderByCreatedAtDesc(Long recipientId, Collection<NotificationType> types, Pageable pageable);
    
    long countByRecipientIdAndIsReadFalse(Long recipientId);
    
    long countByRecipientIdAndRecipientRoleAndIsReadFalse(Long recipientId, Role recipientRole);

    long countByRecipientIdAndIsReadFalseAndTypeIn(Long recipientId, Collection<NotificationType> types);

    long countByRecipientIdAndIsReadFalseAndTypeNotIn(Long recipientId, Collection<NotificationType> types);

    @Query("SELECT n FROM Notification n WHERE n.recipientId = :recipientId AND n.referenceId = :referenceId AND n.type IN :types ORDER BY n.createdAt DESC")
    List<Notification> findByRecipientIdAndReferenceIdAndTypeInList(
            @Param("recipientId") Long recipientId,
            @Param("referenceId") String referenceId,
            @Param("types") Collection<NotificationType> types
    );

    default Optional<Notification> findFirstByRecipientIdAndReferenceIdAndTypeIn(Long recipientId, String referenceId, Collection<NotificationType> types) {
        List<Notification> list = findByRecipientIdAndReferenceIdAndTypeInList(recipientId, referenceId, types);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }
    
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipientId = :recipientId AND n.isRead = false")
    void markAllAsRead(@Param("recipientId") Long recipientId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipientId = :recipientId AND n.type IN :types AND n.isRead = false")
    void markAllAsReadByTypes(@Param("recipientId") Long recipientId, @Param("types") Collection<NotificationType> types);

    @Modifying
    @Query("DELETE FROM Notification n WHERE n.recipientId = :recipientId AND n.referenceId = :referenceId AND n.type IN :types")
    void deleteByRecipientIdAndReferenceIdAndTypeIn(
            @Param("recipientId") Long recipientId,
            @Param("referenceId") String referenceId,
            @Param("types") Collection<NotificationType> types
    );
}
