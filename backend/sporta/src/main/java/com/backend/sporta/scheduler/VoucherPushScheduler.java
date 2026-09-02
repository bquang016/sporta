package com.backend.sporta.scheduler;

import com.backend.sporta.service.VoucherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class VoucherPushScheduler {

    private final VoucherService voucherService;

    /**
     * Run every minute to check for vouchers that have started and need push notifications
     */
    @Scheduled(cron = "0 * * * * *")
    public void processPendingVoucherPushes() {
        try {
            voucherService.processPendingVoucherPushes();
        } catch (Exception e) {
            log.error("Error running VoucherPushScheduler: {}", e.getMessage(), e);
        }
    }
}
