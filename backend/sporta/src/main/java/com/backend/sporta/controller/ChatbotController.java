package com.backend.sporta.controller;

import com.backend.sporta.dto.ai.ChatRequest;
import com.backend.sporta.dto.ai.ChatResponse;
import com.backend.sporta.service.ai.GeminiService;
import com.backend.sporta.service.ai.InMemoryCache;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.TimeUnit;

@Slf4j
@RestController
@RequestMapping({"/api/v1/chat", "/api/chat"})
@RequiredArgsConstructor
public class ChatbotController {

    private final GeminiService geminiService;
    private final InMemoryCache cache;

    private static final int RATE_LIMIT = 10;
    private static final String RATE_LIMIT_PREFIX = "chat_ratelimit:";

    @PostMapping
    public ResponseEntity<?> processChat(@RequestHeader(value = "X-User-Id", required = false, defaultValue = "anonymous") String userId,
                                         @RequestBody ChatRequest chatRequest) {
        
        // Rate Limiting (10 requests / min / user)
        String limitKey = RATE_LIMIT_PREFIX + userId;
        Long currentRequests = cache.increment(limitKey, 1, TimeUnit.MINUTES);
        
        if (currentRequests != null && currentRequests > RATE_LIMIT) {
            log.warn("Rate limit exceeded for user: {}", userId);
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Rate limit exceeded. Please wait a moment.");
        }

        try {
            ChatResponse response = geminiService.processChat(chatRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error processing chat request", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ChatResponse.builder()
                            .replyText("Xin lỗi, mình đang gặp sự cố, bạn thử lại sau nhé.")
                            .build());
        }
    }
}
