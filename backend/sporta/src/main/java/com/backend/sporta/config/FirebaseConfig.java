package com.backend.sporta.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;

import java.io.InputStream;

@Slf4j
@Configuration
public class FirebaseConfig {

    @Value("${firebase.config-path:firebase-service-account.json}")
    private String configPath;

    @Bean
    public FirebaseApp firebaseApp() {
        if (!FirebaseApp.getApps().isEmpty()) {
            return FirebaseApp.getInstance();
        }

        try {
            InputStream serviceAccountStream = null;

            // 1. Thử load từ Classpath (src/main/resources)
            Resource classPathResource = new ClassPathResource(configPath);
            if (classPathResource.exists()) {
                serviceAccountStream = classPathResource.getInputStream();
            } else {
                // 2. Thử load từ FileSystem (Path tuyệt đối hoặc tương đối)
                Resource fileResource = new FileSystemResource(configPath);
                if (fileResource.exists()) {
                    serviceAccountStream = fileResource.getInputStream();
                }
            }

            if (serviceAccountStream != null) {
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccountStream))
                        .build();

                FirebaseApp app = FirebaseApp.initializeApp(options);
                log.info("FirebaseApp successfully initialized with credentials from {}", configPath);
                return app;
            } else {
                log.warn("Firebase credentials file not found at '{}'. FCM Push Notifications will be disabled.", configPath);
            }
        } catch (Exception e) {
            log.error("Failed to initialize FirebaseApp with configPath '{}': {}", configPath, e.getMessage());
        }

        return null;
    }

    @Bean
    public FirebaseMessaging firebaseMessaging(FirebaseApp firebaseApp) {
        if (firebaseApp != null) {
            return FirebaseMessaging.getInstance(firebaseApp);
        }
        return null;
    }
}
