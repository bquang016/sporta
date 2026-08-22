package com.backend.sporta.dto;

import com.backend.sporta.enums.NotificationType;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private String title;
    private String content;
    private NotificationType type;
    private String referenceId;
    
    @JsonProperty("isRead")
    private boolean isRead;
    
    private LocalDateTime createdAt;
}
