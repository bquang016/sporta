package com.backend.sporta.service;

import com.backend.sporta.dto.*;
import java.util.List;
import java.util.UUID;

/**
 * Interface cho Module 3 - Owner Wallet.
 * Quản lý ví chủ sân: phân bổ doanh thu, rút tiền, Admin duyệt.
 */
public interface OwnerWalletService {

    /**
     * Lấy thông tin ví Owner (balance, totalEarned, totalCommission).
     */
    OwnerWalletResponse getBalance(String ownerEmail);

    /**
     * Cộng doanh thu cho Owner khi booking được thanh toán.
     * Tự động trừ chiết khấu nền tảng.
     * Gọi bởi BookingPaidEventListener.
     */
    void creditEarning(UUID ownerId, UUID bookingId, Long paidAmount);

    /**
     * Tạo yêu cầu rút tiền (Owner).
     */
    WithdrawalResponse createWithdrawal(String ownerEmail, CreateWithdrawalRequest request);

    /**
     * Lịch sử yêu cầu rút tiền của Owner (phân trang).
     */
    List<WithdrawalResponse> getMyWithdrawals(String ownerEmail, int page, int size);

    /**
     * Lịch sử giao dịch ví Owner (phân trang).
     */
    List<WalletTransactionResponse> getTransactionHistory(String ownerEmail, int page, int size);

    // ─── Admin Operations ──────────────────────────────────────────────────────

    /**
     * Admin duyệt yêu cầu rút tiền → status = COMPLETED.
     */
    WithdrawalResponse approveWithdrawal(UUID withdrawalId, String adminEmail, String note);

    /**
     * Admin từ chối yêu cầu rút tiền → hoàn lại balance cho Owner.
     */
    WithdrawalResponse rejectWithdrawal(UUID withdrawalId, String adminEmail, String reason);

    /**
     * Admin lấy danh sách yêu cầu rút tiền (filter theo status).
     */
    List<WithdrawalResponse> getWithdrawalsByStatus(String status, int page, int size);

    List<WithdrawalResponse> getAllWithdrawals(int page, int size);

    // ─── Bank Accounts ──────────────────────────────────────────────────────────

    List<BankAccountResponse> getBankAccounts(String ownerEmail);
    BankAccountResponse addBankAccount(String ownerEmail, CreateBankAccountRequest request);
    void deleteBankAccount(String ownerEmail, UUID bankAccountId);
}
