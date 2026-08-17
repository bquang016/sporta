package com.backend.sporta.event;

import com.backend.sporta.service.OwnerWalletService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Lắng nghe BookingPaidEvent từ Module 2 (User Wallet).
 * Khi user thanh toán booking → cộng doanh thu cho Owner (trừ chiết khấu nền tảng).
 */
@Component
@Slf4j
public class BookingPaidEventListener {

    @Autowired
    private OwnerWalletService ownerWalletService;

    @EventListener
    @Transactional
    public void onBookingPaid(BookingPaidEvent event) {
        log.info("Received BookingPaidEvent: bookingId={}, paidAmount={}, ownerId={}",
                event.getBookingId(), event.getPaidAmount(), event.getOwnerId());

        ownerWalletService.creditEarning(
                event.getOwnerId(),
                event.getBookingId(),
                event.getPaidAmount()
        );
    }
}
