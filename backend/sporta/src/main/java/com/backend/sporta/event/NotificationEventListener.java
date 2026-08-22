package com.backend.sporta.event;

import com.backend.sporta.entity.Notification;
import com.backend.sporta.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

    private final NotificationRepository notificationRepository;
    
    // TODO: Add Push Notification Service integration here in Phase 3

    @Async
    @EventListener
    public void handleNotificationEvent(NotificationEvent event) {
        log.info("Received notification event for recipient {} (Role: {}): {}", 
                 event.getRecipientId(), event.getRecipientRole(), event.getTitle());

        try {
            // 1. Save to Database
            Notification notification = Notification.builder()
                    .recipientId(event.getRecipientId())
                    .recipientRole(event.getRecipientRole())
                    .title(event.getTitle())
                    .content(event.getContent())
                    .type(event.getType())
                    .referenceId(event.getReferenceId())
                    .isRead(false)
                    .build();
            
            notificationRepository.save(notification);
            
            // 2. Send Push Notification (Phase 3)
            // pushNotificationService.sendPushNotification(...)
            
        } catch (Exception e) {
            log.error("Error processing notification event: {}", e.getMessage(), e);
        }
    }
}
