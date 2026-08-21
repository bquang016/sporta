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

    @Autowired
    private com.backend.sporta.repository.BookingRepository bookingRepository;

    @Autowired
    private com.backend.sporta.service.VenueRecommendationService recommendationService;

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

        // Ghi nhận chuyển đổi đặt sân cho hệ thống gợi ý AI
        try {
            if (event.getBookingId() != null) {
                bookingRepository.findById(event.getBookingId()).ifPresent(booking -> {
                    if (booking.getVenue() != null && booking.getUser() != null) {
                        recommendationService.recordBooking(booking.getVenue().getId(), booking.getUser().getEmail());
                    }
                });
            }
        } catch (Exception e) {
            log.warn("Lỗi ghi nhận conversion gợi ý sân: {}", e.getMessage());
        }
    }
}
