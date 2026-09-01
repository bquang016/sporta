package com.backend.sporta.scheduler;

import com.backend.sporta.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class PostStatusScheduler {

    private final PostRepository postRepository;

    /**
     * Chạy mỗi 5 phút một lần để quét và cập nhật các bài viết ghép kèo đã quá thời gian thi đấu thành EXPIRED.
     */
    @Scheduled(cron = "0 */5 * * * *")
    @Transactional
    public void scanAndExpireMatchPosts() {
        try {
            LocalDate today = LocalDate.now();
            LocalTime now = LocalTime.now();
            LocalDateTime currentDateTime = LocalDateTime.now();

            int expiredCount = postRepository.markExpiredMatchPosts(today, now, currentDateTime);
            if (expiredCount > 0) {
                log.info("[POST STATUS SCHEDULER] Successfully marked {} match posts as EXPIRED at {}", expiredCount, currentDateTime);
            }
        } catch (Exception e) {
            log.error("[POST STATUS SCHEDULER] Error scanning and expiring match posts: {}", e.getMessage(), e);
        }
    }
}
