package com.backend.sporta.event;

import com.backend.sporta.enums.PaymentTransactionType;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;
import java.util.UUID;

/**
 * Event được publish khi PayOS webhook xác nhận thanh toán thành công.
 * Module 2 (User Wallet) lắng nghe event này để cộng tiền vào ví.
 */
@Getter
public class PaymentCompletedEvent extends ApplicationEvent {

    private final Long orderCode;
    private final Long userId;
    private final Long amount;
    private final PaymentTransactionType transactionType;
    private final String referenceType;
    private final UUID referenceId;

    public PaymentCompletedEvent(Object source, Long orderCode, Long userId, Long amount,
                                  PaymentTransactionType transactionType,
                                  String referenceType, UUID referenceId) {
        super(source);
        this.orderCode = orderCode;
        this.userId = userId;
        this.amount = amount;
        this.transactionType = transactionType;
        this.referenceType = referenceType;
        this.referenceId = referenceId;
    }
}
