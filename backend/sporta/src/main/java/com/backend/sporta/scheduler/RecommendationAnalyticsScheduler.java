package com.backend.sporta.scheduler;

import com.backend.sporta.service.VenueRecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class RecommendationAnalyticsScheduler {

    private final VenueRecommendationService recommendationService;

    /**
     * Chạy định kỳ lúc 02:00 sáng hàng ngày để tổng hợp CTR & Precision@K của ngày hôm trước
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void scheduleDailyMetricsCalculation() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        log.info("Bắt đầu tính toán chỉ số gợi ý sân hàng ngày cho ngày: {}", yesterday);
        try {
            recommendationService.calculateDailyMetrics(yesterday);
            log.info("Hoàn tất tính toán chỉ số gợi ý sân thành công cho ngày: {}", yesterday);
        } catch (Exception e) {
            log.error("Lỗi khi tính toán chỉ số gợi ý sân: {}", e.getMessage(), e);
        }
    }
}
