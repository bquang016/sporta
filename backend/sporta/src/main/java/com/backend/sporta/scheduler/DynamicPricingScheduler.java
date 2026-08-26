package com.backend.sporta.scheduler;

import com.backend.sporta.service.DynamicPricingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DynamicPricingScheduler {

    private final DynamicPricingService dynamicPricingService;

    /**
     * Chạy định kỳ lúc 03:00 sáng hàng ngày để phân tích tỷ lệ lấp đầy
     * và sinh đề xuất giá thông minh cho các chủ sân.
     */
    @Scheduled(cron = "${sporta.dynamic-pricing.scheduler.cron-expression:0 0 3 * * *}")
    public void scheduleDailyDynamicPricingCalculation() {
        log.info("=== BẮT ĐẦU CRON JOB ĐỊNH GIÁ ĐỘNG HÀNG NGÀY (03:00 AM) ===");
        try {
            dynamicPricingService.runDailyDynamicPricingBatch();
            log.info("=== HOÀN TẤT CRON JOB ĐỊNH GIÁ ĐỘNG HÀNG NGÀY THÀNH CÔNG ===");
        } catch (Exception e) {
            log.error("Lỗi khi chạy cron job định giá động: {}", e.getMessage(), e);
        }
    }
}
