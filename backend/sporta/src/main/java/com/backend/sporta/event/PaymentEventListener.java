package com.backend.sporta.event;

import com.backend.sporta.enums.PaymentTransactionType;
import com.backend.sporta.service.UserWalletService;
import com.backend.sporta.service.BookingService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Lắng nghe PaymentCompletedEvent từ Module 1 (Core PayOS).
 * Khi thanh toán PayOS thành công → cộng tiền vào ví user.
 */
@Component
@Slf4j
public class PaymentEventListener {

    @Autowired
    private UserWalletService userWalletService;

    @Autowired
    private BookingService bookingService;

    @EventListener
    @Transactional
    public void onPaymentCompleted(PaymentCompletedEvent event) {
        log.info("Received PaymentCompletedEvent: orderCode={}, type={}, amount={}, userId={}",
                event.getOrderCode(), event.getTransactionType(), event.getAmount(), event.getUserId());

        if (event.getTransactionType() == PaymentTransactionType.TOP_UP) {
            // Nạp ví: cộng tiền vào balance user
            userWalletService.processTopUpCompletion(
                    event.getOrderCode(), event.getAmount(), event.getUserId());
        } else if (event.getTransactionType() == PaymentTransactionType.BOOKING_PAYMENT) {
            // Thanh toán booking: Đổi trạng thái sang CONFIRMED và trigger cộng doanh thu cho sân
            if (event.getReferenceId() != null) {
                bookingService.confirmBookingPayment(event.getReferenceId());
            } else {
                log.error("Missing referenceId for BOOKING_PAYMENT in PaymentCompletedEvent, orderCode={}", event.getOrderCode());
            }
        }
    }
}
