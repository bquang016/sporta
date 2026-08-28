package com.backend.sporta.event;

import com.backend.sporta.enums.NotificationType;
import com.backend.sporta.enums.Role;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class NotificationEvent extends ApplicationEvent {

    private final Long recipientId;
    private final Role recipientRole;
    private final String title;
    private final String content;
    private final NotificationType type;
    private final String referenceId;

    public NotificationEvent(Object source, Long recipientId, Role recipientRole, 
                             String title, String content, NotificationType type, String referenceId) {
        super(source);
        this.recipientId = recipientId;
        this.recipientRole = recipientRole;
        this.title = title;
        this.content = content;
        this.type = type;
        this.referenceId = referenceId;
    }
}
