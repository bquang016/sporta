package com.backend.sporta.controller;

import com.backend.sporta.dto.DeviceTokenRequest;
import com.backend.sporta.dto.NotificationDTO;
import com.backend.sporta.entity.User;
import com.backend.sporta.exception.CustomException;
import com.backend.sporta.repository.UserRepository;
import com.backend.sporta.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));
    }

    @GetMapping
    public ResponseEntity<Page<NotificationDTO>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        User user = getCurrentUser();
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(notificationService.getUserNotifications(user.getId(), pageable));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount() {
        User user = getCurrentUser();
        return ResponseEntity.ok(notificationService.getUnreadCount(user.getId()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        User user = getCurrentUser();
        notificationService.markAsRead(id, user.getId());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        User user = getCurrentUser();
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/device-token")
    public ResponseEntity<Void> registerDeviceToken(@Valid @RequestBody DeviceTokenRequest request) {
        User user = getCurrentUser();
        notificationService.registerDeviceToken(user.getId(), request);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/device-token")
    public ResponseEntity<Void> removeDeviceToken(@RequestParam String token) {
        notificationService.removeDeviceToken(token);
        return ResponseEntity.ok().build();
    }
}
