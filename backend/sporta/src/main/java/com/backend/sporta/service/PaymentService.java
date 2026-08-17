package com.backend.sporta.service;

import com.backend.sporta.dto.CreatePaymentResponse;
import com.backend.sporta.dto.PaymentTransactionResponse;
import com.backend.sporta.entity.PaymentTransaction;
import com.backend.sporta.enums.PaymentTransactionType;
import java.util.List;
import java.util.UUID;

/**
 * Interface cho Module 1 - Core PayOS.
 * Module 2 (User Wallet) gọi qua interface này để tạo link thanh toán.
 * Đảm bảo loosely coupled giữa các module.
 */
public interface PaymentService {

    /**
     * Tạo link thanh toán PayOS.
     *
     * @param userId          ID người dùng tạo giao dịch
     * @param amount          Số tiền (VNĐ)
     * @param type            Loại giao dịch (TOP_UP hoặc BOOKING_PAYMENT)
     * @param description     Mô tả giao dịch
     * @param referenceType   Loại tham chiếu (nullable, vd: "BOOKING")
     * @param referenceId     ID tham chiếu (nullable, vd: bookingId)
     * @return DTO chứa checkoutUrl, qrCode, orderCode
     */
    CreatePaymentResponse createPaymentLink(Long userId, Long amount,
                                             PaymentTransactionType type, String description,
                                             String referenceType, UUID referenceId);

    /**
     * Lấy thông tin giao dịch theo orderCode (dùng cho webhook và polling).
     */
    PaymentTransaction getByOrderCode(Long orderCode);

    /**
     * Lấy trạng thái giao dịch theo orderCode (dùng cho Mobile polling).
     */
    PaymentTransactionResponse getTransactionStatus(Long orderCode);

    /**
     * Lịch sử giao dịch PayOS của user.
     */
    List<PaymentTransactionResponse> getUserTransactions(Long userId, int page, int size);
}
