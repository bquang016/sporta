package com.backend.sporta.service;

import com.backend.sporta.dto.DeviceTokenRequest;
import com.backend.sporta.dto.NotificationDTO;
import com.backend.sporta.entity.DeviceToken;
import com.backend.sporta.entity.Notification;
import com.backend.sporta.enums.NotificationType;
import com.backend.sporta.enums.Role;
import com.backend.sporta.repository.DeviceTokenRepository;
import com.backend.sporta.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final DeviceTokenRepository deviceTokenRepository;

    @Transactional
    public void createNotification(Long recipientId, Role role, String title, String content, NotificationType type, String referenceId) {
        Notification notification = Notification.builder()
                .recipientId(recipientId)
                .recipientRole(role != null ? role : Role.PLAYER)
                .title(title)
                .content(content)
                .type(type)
                .referenceId(referenceId)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        notificationRepository.save(notification);
    }

    public Page<NotificationDTO> getUserNotifications(Long recipientId, Pageable pageable) {
        Page<Notification> notifications = notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(recipientId, pageable);
        
        return notifications.map(this::mapToDTO);
    }

    public long getUnreadCount(Long recipientId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(recipientId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long recipientId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            if (notification.getRecipientId().equals(recipientId)) {
                notification.setRead(true);
                notificationRepository.save(notification);
            }
        });
    }

    @Transactional
    public void markAllAsRead(Long recipientId) {
        notificationRepository.markAllAsRead(recipientId);
    }

    @Transactional
    public void registerDeviceToken(Long userId, DeviceTokenRequest request) {
        Optional<DeviceToken> existingToken = deviceTokenRepository.findByToken(request.getToken());
        
        if (existingToken.isPresent()) {
            DeviceToken token = existingToken.get();
            if (!token.getUserId().equals(userId)) {
                token.setUserId(userId);
                deviceTokenRepository.save(token);
            }
        } else {
            DeviceToken newToken = DeviceToken.builder()
                    .userId(userId)
                    .token(request.getToken())
                    .deviceType(request.getDeviceType())
                    .build();
            deviceTokenRepository.save(newToken);
        }
    }
    
    @Transactional
    public void removeDeviceToken(String token) {
        deviceTokenRepository.deleteByToken(token);
    }

    private NotificationDTO mapToDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .content(notification.getContent())
                .type(notification.getType())
                .referenceId(notification.getReferenceId())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
