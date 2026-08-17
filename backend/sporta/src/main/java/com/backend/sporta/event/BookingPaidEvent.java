package com.backend.sporta.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;
import java.util.UUID;

/**
 * Event được publish khi User thanh toán booking bằng ví thành công.
 * Module 3 (Owner Wallet) lắng nghe event này để cộng doanh thu cho Owner.
 */
@Getter
public class BookingPaidEvent extends ApplicationEvent {

    private final UUID bookingId;
    private final Long paidAmount;   // Số tiền user thực trả (sau discount)
    private final UUID venueId;
    private final UUID ownerId;

    public BookingPaidEvent(Object source, UUID bookingId, Long paidAmount,
                            UUID venueId, UUID ownerId) {
        super(source);
        this.bookingId = bookingId;
        this.paidAmount = paidAmount;
        this.venueId = venueId;
        this.ownerId = ownerId;
    }
}
