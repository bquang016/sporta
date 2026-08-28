package com.backend.sporta.event;

import com.backend.sporta.enums.NotificationType;
import com.backend.sporta.enums.Role;
import com.backend.sporta.service.OwnerWalletService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Slf4j
public class BookingPaidEventListener {

    @Autowired
    private OwnerWalletService ownerWalletService;

    @Autowired
    private com.backend.sporta.repository.BookingRepository bookingRepository;

    @Autowired
    private com.backend.sporta.service.VenueRecommendationService recommendationService;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @EventListener
    @Transactional
    public void onBookingPaid(BookingPaidEvent event) {
        log.info("Received BookingPaidEvent: bookingId={}, paidAmount={}, ownerId={}",
                event.getBookingId(), event.getPaidAmount(), event.getOwnerId());

        try {
            if (event.getOwnerId() != null) {
                ownerWalletService.creditEarning(
                        event.getOwnerId(),
                        event.getBookingId(),
                        event.getPaidAmount()
                );
            }
        } catch (Exception e) {
            log.warn("Lỗi cộng ví chủ sân: {}", e.getMessage());
        }

        try {
            if (event.getBookingId() != null) {
                bookingRepository.findById(event.getBookingId()).ifPresent(booking -> {
                    if (booking.getVenue() != null && booking.getUser() != null) {
                        try {
                            recommendationService.recordBooking(booking.getVenue().getId(), booking.getUser().getEmail());
                        } catch (Exception ignored) {}

                        // Gửi thông báo cho Owner (Chủ sân)
                        if (booking.getVenue().getOwner() != null && booking.getVenue().getOwner().getUser() != null) {
                            eventPublisher.publishEvent(new NotificationEvent(
                                    this,
                                    booking.getVenue().getOwner().getUser().getId(),
                                    Role.OWNER,
                                    "Đơn đặt sân mới! 💵",
                                    "Khách hàng " + booking.getUser().getFullName() + " vừa đặt sân tại " + booking.getVenue().getName() + " (" + String.format("%,d", Math.round(booking.getFinalPrice())) + "đ).",
                                    NotificationType.OWNER_NEW_BOOKING,
                                    booking.getId().toString()
                            ));
                        }
                    }
                });
            }
        } catch (Exception e) {
            log.warn("Lỗi xử lý hậu thanh toán booking: {}", e.getMessage());
        }
    }
}
