package com.backend.sporta.event;

import com.backend.sporta.entity.Notification;
import com.backend.sporta.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

    private final NotificationService notificationService;

    @Async
    @EventListener
    public void handleNotificationEvent(NotificationEvent event) {
        log.info("Received notification event for recipient {} (Role: {}): {}", 
                 event.getRecipientId(), event.getRecipientRole(), event.getTitle());

        try {
            notificationService.createNotification(
                    event.getRecipientId(),
                    event.getRecipientRole(),
                    event.getTitle(),
                    event.getContent(),
                    event.getType(),
                    event.getReferenceId()
            );
        } catch (Exception e) {
            log.error("Error processing notification event: {}", e.getMessage(), e);
        }
    }
}
