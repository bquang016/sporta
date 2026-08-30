package com.backend.sporta.service;

import com.backend.sporta.entity.DeviceToken;
import com.backend.sporta.repository.DeviceTokenRepository;
import com.google.firebase.messaging.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class FcmService {

    private final FirebaseMessaging firebaseMessaging;
    private final DeviceTokenRepository deviceTokenRepository;

    /**
     * Gửi Push Notification tới tất cả thiết bị đã đăng ký của một người dùng.
     */
    @Async
    @Transactional
    public void sendPushToUser(Long userId, String title, String body, Map<String, String> dataPayload) {
        if (firebaseMessaging == null) {
            log.debug("FirebaseMessaging is not initialized. Skipping push notification to user {}", userId);
            return;
        }

        List<DeviceToken> deviceTokens = deviceTokenRepository.findByUserId(userId);
        if (deviceTokens.isEmpty()) {
            log.debug("No registered device tokens found for user {}", userId);
            return;
        }

        for (DeviceToken deviceToken : deviceTokens) {
            sendPushToSingleToken(deviceToken, title, body, dataPayload);
        }
    }

    private void sendPushToSingleToken(DeviceToken deviceToken, String title, String body, Map<String, String> dataPayload) {
        try {
            Notification notification = Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build();

            Message.Builder messageBuilder = Message.builder()
                    .setToken(deviceToken.getToken())
                    .setNotification(notification);

            if (dataPayload != null && !dataPayload.isEmpty()) {
                messageBuilder.putAllData(dataPayload);
            }

            // Android specific configuration
            AndroidConfig androidConfig = AndroidConfig.builder()
                    .setPriority(AndroidConfig.Priority.HIGH)
                    .setNotification(AndroidNotification.builder()
                            .setSound("default")
                            .setChannelId("default")
                            .build())
                    .build();
            messageBuilder.setAndroidConfig(androidConfig);

            // iOS specific configuration (APNS)
            ApnsConfig apnsConfig = ApnsConfig.builder()
                    .setAps(Aps.builder()
                            .setSound("default")
                            .setBadge(1)
                            .build())
                    .build();
            messageBuilder.setApnsConfig(apnsConfig);

            String response = firebaseMessaging.send(messageBuilder.build());
            log.info("FCM push sent successfully to token (userId: {}), msgId: {}", deviceToken.getUserId(), response);
        } catch (FirebaseMessagingException e) {
            log.error("FCM send error for user {} (token: {}): {} [code: {}]",
                    deviceToken.getUserId(), deviceToken.getToken(), e.getMessage(), e.getMessagingErrorCode());

            // Tự động dọn dẹp các token hết hạn hoặc không còn tồn tại
            if (e.getMessagingErrorCode() == MessagingErrorCode.UNREGISTERED ||
                e.getMessagingErrorCode() == MessagingErrorCode.INVALID_ARGUMENT) {
                log.info("Removing stale device token for user {}", deviceToken.getUserId());
                try {
                    deviceTokenRepository.deleteByToken(deviceToken.getToken());
                } catch (Exception ex) {
                    log.error("Failed to delete invalid token from DB: {}", ex.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("Unexpected error sending FCM notification to token: {}", e.getMessage(), e);
        }
    }
}
