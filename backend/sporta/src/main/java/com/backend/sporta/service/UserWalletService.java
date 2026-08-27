package com.backend.sporta.service;

import com.backend.sporta.dto.*;
import java.util.List;
import java.util.UUID;

/**
 * Interface cho Module 2 - User Wallet.
 * Quản lý ví người dùng: nạp tiền, thanh toán booking, xem lịch sử.
 */
public interface UserWalletService {

    /**
     * Lấy số dư ví của user.
     */
    WalletBalanceResponse getBalance(String userEmail);

    /**
     * Tạo yêu cầu nạp tiền vào ví qua PayOS.
     * Trả về link thanh toán cho Mobile mở WebView.
     */
    TopUpResponse initiateTopUp(String userEmail, TopUpRequest request);

    /**
     * Xử lý khi nạp tiền thành công (gọi bởi PaymentEventListener).
     * Cộng tiền vào balance và log giao dịch.
     */
    void processTopUpCompletion(Long orderCode, Long amount, Long userId);

    /**
     * Thanh toán booking bằng ví (có giảm giá ưu đãi ví).
     */
    BookingResponse payBookingWithWallet(String userEmail, WalletPayBookingRequest request);

    /**
     * Hoàn tiền đặt sân vào ví người dùng (gọi khi hủy đơn).
     * @return Số dư ví sau khi hoàn tiền
     */
    long creditBookingRefund(Long userId, UUID bookingId, Long refundAmount, String bookingCode, int refundRate);

    /**
     * Lịch sử giao dịch ví (phân trang).
     */
    List<WalletTransactionResponse> getTransactionHistory(String userEmail, int page, int size);
}
