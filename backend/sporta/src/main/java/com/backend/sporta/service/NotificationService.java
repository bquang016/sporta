package com.backend.sporta.service;

import com.backend.sporta.dto.DeviceTokenRequest;
import com.backend.sporta.dto.NotificationDTO;
import com.backend.sporta.entity.DeviceToken;
import com.backend.sporta.entity.Notification;
import com.backend.sporta.entity.User;
import com.backend.sporta.enums.NotificationType;
import com.backend.sporta.enums.Role;
import com.backend.sporta.repository.DeviceTokenRepository;
import com.backend.sporta.repository.NotificationRepository;
import com.backend.sporta.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {
    private String stripEmojis(String text) {
        if (text == null) return null;
        return text.replaceAll("[\\p{So}\\p{Cn}\\uD83C-\\uDBFF\\uDC00-\\uDFFF\\u2600-\\u26FF\\u2700-\\u27BF]", "").trim();
    }

    public static final List<NotificationType> SOCIAL_NOTIFICATION_TYPES = List.of(
            NotificationType.POST_LIKED,
            NotificationType.POST_COMMENTED,
            NotificationType.POST_REACTED
    );

    private final NotificationRepository notificationRepository;
    private final DeviceTokenRepository deviceTokenRepository;
    private final UserRepository userRepository;
    private final FcmService fcmService;

    private boolean isBookingType(NotificationType type) {
        if (type == null) return false;
        return type == NotificationType.BOOKING_SUCCESS ||
               type == NotificationType.BOOKING_CANCELLED ||
               type == NotificationType.BOOKING_REMINDER;
    }

    private boolean isMatchmakeType(NotificationType type) {
        if (type == null) return false;
        return type == NotificationType.MATCH_INVITE ||
               type == NotificationType.MATCH_REQUEST_JOIN ||
               type == NotificationType.MATCH_JOIN_ACCEPTED ||
               type == NotificationType.MATCH_JOIN_REJECTED ||
               type == NotificationType.MATCH_REMINDER ||
               type == NotificationType.MATCH_CANCELLED ||
               type == NotificationType.CLUB_INVITE ||
               type == NotificationType.CLUB_JOIN_REQUEST ||
               type == NotificationType.CLUB_JOIN_ACCEPTED;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void createNotification(Long recipientId, Role role, String title, String content, NotificationType type, String referenceId, Long actorId, String actorAvatar) {
        try {
            title = stripEmojis(title);
            content = stripEmojis(content);
            Notification notification = Notification.builder()
                    .recipientId(recipientId)
                    .recipientRole(role != null ? role : Role.PLAYER)
                    .title(title != null ? title : "Thông báo Sporta")
                    .content(content != null ? content : "")
                    .type(type != null ? type : NotificationType.SYSTEM_ALERT)
                    .referenceId(referenceId)
                    .actorId(actorId)
                    .actorAvatar(actorAvatar)
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();
            Notification saved = notificationRepository.save(notification);

            // Gửi Firebase FCM Push Notification bất đồng bộ
            Map<String, String> dataPayload = new HashMap<>();
            if (type != null) {
                dataPayload.put("type", type.name());
            }
            if (referenceId != null) {
                dataPayload.put("referenceId", referenceId);
            }
            if (actorId != null) {
                dataPayload.put("actorId", String.valueOf(actorId));
            }
            dataPayload.put("notificationId", String.valueOf(saved.getId()));

            boolean shouldSendPush = true;
            if ((role == null || role == Role.PLAYER) && type != null) {
                User user = userRepository.findById(recipientId).orElse(null);
                if (user != null) {
                    if (isBookingType(type) && Boolean.FALSE.equals(user.getNotifBooking())) {
                        shouldSendPush = false;
                        log.info("Skipping FCM push for recipient {} due to notifBooking=false", recipientId);
                    }
                    if (isMatchmakeType(type) && Boolean.FALSE.equals(user.getNotifMatchmake())) {
                        shouldSendPush = false;
                        log.info("Skipping FCM push for recipient {} due to notifMatchmake=false", recipientId);
                    }
                }
            }

            if (shouldSendPush) {
                fcmService.sendPushToUser(recipientId, title, content, dataPayload);
            }
        } catch (Exception e) {
            log.error("Lỗi tạo notification cho recipientId {}: {}", recipientId, e.getMessage());
        }
    }

    public void createNotification(Long recipientId, Role role, String title, String content, NotificationType type, String referenceId) {
        createNotification(recipientId, role, title, content, type, referenceId, null, null);
    }

    @org.springframework.scheduling.annotation.Async
    public void sendBulkPromotionNotification(List<Long> recipientIds, String title, String content, String referenceId) {
        if (recipientIds == null || recipientIds.isEmpty()) return;
        for (Long userId : recipientIds) {
            createNotification(userId, Role.PLAYER, title, content, NotificationType.PROMOTION, referenceId);
        }
    }

    // System (non-social) notifications
    public Page<NotificationDTO> getUserNotifications(Long recipientId, Pageable pageable) {
        Page<Notification> notifications = notificationRepository
                .findByRecipientIdAndTypeNotInOrderByCreatedAtDesc(recipientId, SOCIAL_NOTIFICATION_TYPES, pageable);
        
        return notifications.map(this::mapToDTO);
    }

    public long getUnreadCount(Long recipientId) {
        return notificationRepository.countByRecipientIdAndIsReadFalseAndTypeNotIn(recipientId, SOCIAL_NOTIFICATION_TYPES);
    }

    // Social-specific notifications
    public Page<NotificationDTO> getSocialNotifications(Long recipientId, Pageable pageable) {
        Page<Notification> notifications = notificationRepository
                .findByRecipientIdAndTypeInOrderByCreatedAtDesc(recipientId, SOCIAL_NOTIFICATION_TYPES, pageable);
        
        return notifications.map(this::mapToDTO);
    }

    public long getUnreadSocialCount(Long recipientId) {
        return notificationRepository.countByRecipientIdAndIsReadFalseAndTypeIn(recipientId, SOCIAL_NOTIFICATION_TYPES);
    }

    @Transactional
    public void markAllSocialAsRead(Long recipientId) {
        notificationRepository.markAllAsReadByTypes(recipientId, SOCIAL_NOTIFICATION_TYPES);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void upsertReactionNotification(Long recipientId, Long actorId, String actorName, String actorAvatar, Long postId, String reactionType) {
        log.info("[NOTIF-DEBUG] upsertReactionNotification called: recipientId={}, actorId={}, postId={}, reactionType={}", recipientId, actorId, postId, reactionType);
        if (recipientId == null || actorId == null || recipientId.equals(actorId)) {
            log.info("[NOTIF-DEBUG] Skipped: recipientId={}, actorId={} (self or null)", recipientId, actorId);
            return;
        }
        try {
            String referenceId = "post:" + postId + ":actor:" + actorId;
            String content = getReactionPhrase(reactionType);
            String title = actorName != null ? actorName : "Người chơi Sporta";

            Optional<Notification> existing = notificationRepository
                    .findFirstByRecipientIdAndReferenceIdAndTypeIn(
                            recipientId,
                            referenceId,
                            List.of(NotificationType.POST_REACTED, NotificationType.POST_LIKED)
                    );

            log.info("[NOTIF-DEBUG] existing notification found: {}", existing.isPresent());

            if (existing.isPresent()) {
                Notification notification = existing.get();
                notification.setContent(stripEmojis(content));
                notification.setType(NotificationType.POST_REACTED);
                notification.setActorAvatar(actorAvatar);
                notification.setActorId(actorId);
                notification.setRead(false);
                notification.setCreatedAt(LocalDateTime.now());
                notificationRepository.save(notification);
                log.info("[NOTIF-DEBUG] Updated existing notification id={}", notification.getId());
            } else {
                Notification notification = Notification.builder()
                        .recipientId(recipientId)
                        .recipientRole(Role.PLAYER)
                        .title(stripEmojis(title))
                        .content(stripEmojis(content))
                        .type(NotificationType.POST_REACTED)
                        .referenceId(referenceId)
                        .actorId(actorId)
                        .actorAvatar(actorAvatar)
                        .isRead(false)
                        .createdAt(LocalDateTime.now())
                        .build();
                Notification saved = notificationRepository.save(notification);
                log.info("[NOTIF-DEBUG] Created NEW notification id={}", saved.getId());

                // Send push notification
                Map<String, String> dataPayload = new HashMap<>();
                dataPayload.put("type", NotificationType.POST_REACTED.name());
                dataPayload.put("referenceId", referenceId);
                dataPayload.put("postId", String.valueOf(postId));
                dataPayload.put("reactionType", reactionType != null ? reactionType : "like");
                fcmService.sendPushToUser(recipientId, title, content, dataPayload);
            }
        } catch (Exception e) {
            log.error("[NOTIF-DEBUG] ERROR in upsertReactionNotification: {}", e.getMessage(), e);
        }
    }

    public void upsertReactionNotification(Long recipientId, Long actorId, String actorName, Long postId, String reactionType) {
        upsertReactionNotification(recipientId, actorId, actorName, null, postId, reactionType);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void deleteReactionNotification(Long recipientId, Long actorId, Long postId) {
        if (recipientId == null || actorId == null) {
            return;
        }
        try {
            String referenceId = "post:" + postId + ":actor:" + actorId;
            notificationRepository.deleteByRecipientIdAndReferenceIdAndTypeIn(
                    recipientId,
                    referenceId,
                    List.of(NotificationType.POST_REACTED, NotificationType.POST_LIKED)
            );
        } catch (Exception e) {
            log.error("Lỗi xóa reaction notification: {}", e.getMessage());
        }
    }

    private String getReactionPhrase(String reactionType) {
        if (reactionType == null) return "đã thích bài viết của bạn.";
        switch (reactionType.toLowerCase()) {
            case "love":
                return "đã thả tim và yêu thích bài viết của bạn.";
            case "fire":
                return "thấy bài viết này của bạn thật bùng nổ và nhiệt huyết!";
            case "muscle":
                return "thấy bài viết này của bạn tràn đầy năng lượng và thật mạnh mẽ!";
            case "trophy":
                return "đánh giá bài viết của bạn đạt phong độ vô địch đỉnh cao!";
            case "clap":
                return "đã nhiệt tình vỗ tay cổ vũ cho bài viết của bạn.";
            case "like":
            default:
                return "đã thích bài viết của bạn.";
        }
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
        String avatar = notification.getActorAvatar();
        if ((avatar == null || avatar.trim().isEmpty()) && notification.getActorId() != null) {
            Optional<User> actorOpt = userRepository.findById(notification.getActorId());
            if (actorOpt.isPresent()) {
                avatar = actorOpt.get().getAvatarUrl();
            }
        }

        return NotificationDTO.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .content(notification.getContent())
                .type(notification.getType())
                .referenceId(notification.getReferenceId())
                .actorId(notification.getActorId())
                .actorAvatar(avatar)
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
