package com.backend.sporta.service;

import com.backend.sporta.dto.*;
import com.backend.sporta.entity.*;
import com.backend.sporta.enums.*;
import com.backend.sporta.exception.CustomException;
import com.backend.sporta.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class OwnerWalletServiceImpl implements OwnerWalletService {

    @Autowired
    private OwnerWalletRepository ownerWalletRepository;

    @Autowired
    private WalletTransactionRepository walletTransactionRepository;

    @Autowired
    private WithdrawalRequestRepository withdrawalRequestRepository;

    @Autowired
    private OwnerBankAccountRepository ownerBankAccountRepository;

    @Autowired
    private OwnerRepository ownerRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${platform.commission-rate:0.10}")
    private double commissionRate;

    private static final NumberFormat VND_FORMAT = NumberFormat.getInstance(new Locale("vi", "VN"));

    // ─── Get Balance ────────────────────────────────────────────────────────────

    @Override
    public OwnerWalletResponse getBalance(String ownerEmail) {
        Owner owner = findOwnerByEmail(ownerEmail);
        OwnerWallet wallet = getOrCreateWallet(owner);

        return OwnerWalletResponse.builder()
                .balance(wallet.getBalance())
                .totalEarned(wallet.getTotalEarned())
                .totalCommission(wallet.getTotalCommission())
                .formattedBalance(VND_FORMAT.format(wallet.getBalance()) + " VNĐ")
                .formattedTotalEarned(VND_FORMAT.format(wallet.getTotalEarned()) + " VNĐ")
                .formattedTotalCommission(VND_FORMAT.format(wallet.getTotalCommission()) + " VNĐ")
                .build();
    }

    // ─── Credit Earning (Called by BookingPaidEventListener) ─────────────────────

    @Override
    @Transactional
    public void creditEarning(UUID ownerId, UUID bookingId, Long paidAmount) {
        Owner owner = ownerRepository.findById(ownerId)
                .orElseThrow(() -> new CustomException("Không tìm thấy chủ sân", 404));

        OwnerWallet wallet = getOrCreateWallet(owner);

        // Tính chiết khấu nền tảng
        long commission = Math.round(paidAmount * commissionRate);
        long earning = paidAmount - commission;

        long balanceBefore = wallet.getBalance();

        // Cộng doanh thu
        wallet.setBalance(balanceBefore + earning);
        wallet.setTotalEarned(wallet.getTotalEarned() + earning);
        wallet.setTotalCommission(wallet.getTotalCommission() + commission);
        ownerWalletRepository.save(wallet);

        // Log giao dịch BOOKING_EARNING
        WalletTransaction earningTxn = WalletTransaction.builder()
                .walletType(WalletType.OWNER)
                .ownerId(ownerId)
                .transactionType(WalletTransactionType.BOOKING_EARNING)
                .amount(earning)
                .balanceBefore(balanceBefore)
                .balanceAfter(wallet.getBalance())
                .referenceId(bookingId)
                .description("Doanh thu đặt sân (sau chiết khấu " + Math.round(commissionRate * 100) + "%)")
                .build();
        walletTransactionRepository.save(earningTxn);

        // Log giao dịch COMMISSION_DEDUCT (ghi nhận chiết khấu)
        WalletTransaction commissionTxn = WalletTransaction.builder()
                .walletType(WalletType.OWNER)
                .ownerId(ownerId)
                .transactionType(WalletTransactionType.COMMISSION_DEDUCT)
                .amount(commission)
                .balanceBefore(balanceBefore)
                .balanceAfter(wallet.getBalance())
                .referenceId(bookingId)
                .description("Chiết khấu nền tảng " + Math.round(commissionRate * 100) + "%")
                .build();
        walletTransactionRepository.save(commissionTxn);

        log.info("Owner earning credited: ownerId={}, bookingId={}, earning={}, commission={}",
                ownerId, bookingId, earning, commission);
    }

    // ─── Create Withdrawal ──────────────────────────────────────────────────────

    @Override
    @Transactional
    public WithdrawalResponse createWithdrawal(String ownerEmail, CreateWithdrawalRequest request) {
        Owner owner = findOwnerByEmail(ownerEmail);
        OwnerWallet wallet = getOrCreateWallet(owner);

        if (request.getAmount() > wallet.getBalance()) {
            throw new CustomException(
                    String.format("Số dư không đủ. Bạn có %s VNĐ, yêu cầu rút %s VNĐ",
                            VND_FORMAT.format(wallet.getBalance()),
                            VND_FORMAT.format(request.getAmount())),
                    400);
        }

        // Đóng băng tiền: trừ balance ngay khi tạo request
        long balanceBefore = wallet.getBalance();
        wallet.setBalance(balanceBefore - request.getAmount());
        ownerWalletRepository.save(wallet);

        // Tạo withdrawal request
        WithdrawalRequest withdrawal = WithdrawalRequest.builder()
                .owner(owner)
                .amount(request.getAmount())
                .bankCode(request.getBankCode())
                .bankAccountNumber(request.getBankAccountNumber())
                .bankAccountName(request.getBankAccountName())
                .status(WithdrawalStatus.PENDING)
                .build();
        withdrawalRequestRepository.save(withdrawal);

        // Log giao dịch
        WalletTransaction txn = WalletTransaction.builder()
                .walletType(WalletType.OWNER)
                .ownerId(owner.getId())
                .transactionType(WalletTransactionType.WITHDRAWAL)
                .amount(request.getAmount())
                .balanceBefore(balanceBefore)
                .balanceAfter(wallet.getBalance())
                .referenceId(withdrawal.getId())
                .description("Yêu cầu rút tiền - " + request.getBankCode() + " " + request.getBankAccountNumber())
                .build();
        walletTransactionRepository.save(txn);

        log.info("Withdrawal request created: ownerId={}, amount={}, withdrawalId={}",
                owner.getId(), request.getAmount(), withdrawal.getId());

        return mapToWithdrawalResponse(withdrawal);
    }

    // ─── My Withdrawals ─────────────────────────────────────────────────────────

    @Override
    public List<WithdrawalResponse> getMyWithdrawals(String ownerEmail, int page, int size) {
        Owner owner = findOwnerByEmail(ownerEmail);
        return withdrawalRequestRepository
                .findByOwnerIdOrderByCreatedAtDesc(owner.getId(), PageRequest.of(page, size))
                .stream()
                .map(this::mapToWithdrawalResponse)
                .collect(Collectors.toList());
    }

    // ─── Transaction History ────────────────────────────────────────────────────

    @Override
    public List<WalletTransactionResponse> getTransactionHistory(String ownerEmail, int page, int size) {
        Owner owner = findOwnerByEmail(ownerEmail);
        return walletTransactionRepository
                .findByWalletTypeAndOwnerIdOrderByCreatedAtDesc(WalletType.OWNER, owner.getId(), PageRequest.of(page, size))
                .stream()
                .map(this::mapToWalletTxnResponse)
                .collect(Collectors.toList());
    }

    // ─── Admin: Approve Withdrawal ──────────────────────────────────────────────

    @Override
    @Transactional
    public WithdrawalResponse approveWithdrawal(UUID withdrawalId, String adminEmail, String note) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new CustomException("Không tìm thấy admin", 404));

        WithdrawalRequest withdrawal = withdrawalRequestRepository.findById(withdrawalId)
                .orElseThrow(() -> new CustomException("Không tìm thấy yêu cầu rút tiền", 404));

        if (withdrawal.getStatus() != WithdrawalStatus.PENDING) {
            throw new CustomException("Yêu cầu rút tiền đã được xử lý trước đó", 400);
        }

        withdrawal.setStatus(WithdrawalStatus.COMPLETED);
        withdrawal.setAdminUserId(admin.getId());
        withdrawal.setAdminNote(note);
        withdrawal.setProcessedAt(LocalDateTime.now());
        withdrawalRequestRepository.save(withdrawal);

        log.info("Withdrawal approved: id={}, adminId={}", withdrawalId, admin.getId());

        return mapToWithdrawalResponse(withdrawal);
    }

    // ─── Admin: Reject Withdrawal ───────────────────────────────────────────────

    @Override
    @Transactional
    public WithdrawalResponse rejectWithdrawal(UUID withdrawalId, String adminEmail, String reason) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new CustomException("Không tìm thấy admin", 404));

        WithdrawalRequest withdrawal = withdrawalRequestRepository.findById(withdrawalId)
                .orElseThrow(() -> new CustomException("Không tìm thấy yêu cầu rút tiền", 404));

        if (withdrawal.getStatus() != WithdrawalStatus.PENDING) {
            throw new CustomException("Yêu cầu rút tiền đã được xử lý trước đó", 400);
        }

        // Hoàn lại balance cho Owner
        Owner owner = withdrawal.getOwner();
        OwnerWallet wallet = getOrCreateWallet(owner);
        long balanceBefore = wallet.getBalance();
        wallet.setBalance(balanceBefore + withdrawal.getAmount());
        ownerWalletRepository.save(wallet);

        // Log giao dịch hoàn tiền
        WalletTransaction refundTxn = WalletTransaction.builder()
                .walletType(WalletType.OWNER)
                .ownerId(owner.getId())
                .transactionType(WalletTransactionType.WITHDRAWAL)
                .amount(withdrawal.getAmount())
                .balanceBefore(balanceBefore)
                .balanceAfter(wallet.getBalance())
                .referenceId(withdrawal.getId())
                .description("Hoàn tiền do từ chối rút tiền: " + (reason != null ? reason : ""))
                .build();
        walletTransactionRepository.save(refundTxn);

        // Cập nhật withdrawal
        withdrawal.setStatus(WithdrawalStatus.REJECTED);
        withdrawal.setAdminUserId(admin.getId());
        withdrawal.setAdminNote(reason);
        withdrawal.setProcessedAt(LocalDateTime.now());
        withdrawalRequestRepository.save(withdrawal);

        log.info("Withdrawal rejected: id={}, adminId={}, reason={}", withdrawalId, admin.getId(), reason);

        return mapToWithdrawalResponse(withdrawal);
    }

    // ─── Admin: Get Withdrawals ─────────────────────────────────────────────────

    @Override
    public List<WithdrawalResponse> getWithdrawalsByStatus(String status, int page, int size) {
        WithdrawalStatus withdrawalStatus = WithdrawalStatus.valueOf(status.toUpperCase());
        return withdrawalRequestRepository
                .findByStatusOrderByCreatedAtAsc(withdrawalStatus, PageRequest.of(page, size))
                .stream()
                .map(this::mapToWithdrawalResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<WithdrawalResponse> getAllWithdrawals(int page, int size) {
        return withdrawalRequestRepository
                .findAllByOrderByCreatedAtDesc(PageRequest.of(page, size))
                .stream()
                .map(this::mapToWithdrawalResponse)
                .collect(Collectors.toList());
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────

    private Owner findOwnerByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));
        return ownerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin chủ sân", 404));
    }

    private OwnerWallet getOrCreateWallet(Owner owner) {
        return ownerWalletRepository.findByOwnerId(owner.getId())
                .orElseGet(() -> {
                    OwnerWallet newWallet = OwnerWallet.builder()
                            .owner(owner)
                            .balance(0L)
                            .totalEarned(0L)
                            .totalCommission(0L)
                            .build();
                    return ownerWalletRepository.save(newWallet);
                });
    }

    private WithdrawalResponse mapToWithdrawalResponse(WithdrawalRequest w) {
        return WithdrawalResponse.builder()
                .id(w.getId())
                .ownerId(w.getOwner().getId())
                .ownerName(w.getOwner().getFullName())
                .amount(w.getAmount())
                .formattedAmount(VND_FORMAT.format(w.getAmount()) + " VNĐ")
                .bankCode(w.getBankCode())
                .bankAccountNumber(w.getBankAccountNumber())
                .bankAccountName(w.getBankAccountName())
                .status(w.getStatus())
                .adminNote(w.getAdminNote())
                .processedAt(w.getProcessedAt())
                .createdAt(w.getCreatedAt())
                .build();
    }

    private WalletTransactionResponse mapToWalletTxnResponse(WalletTransaction txn) {
        return WalletTransactionResponse.builder()
                .id(txn.getId())
                .walletType(txn.getWalletType())
                .transactionType(txn.getTransactionType())
                .amount(txn.getAmount())
                .balanceBefore(txn.getBalanceBefore())
                .balanceAfter(txn.getBalanceAfter())
                .referenceId(txn.getReferenceId())
                .description(txn.getDescription())
                .createdAt(txn.getCreatedAt())
                .build();
    }

    // ─── Bank Accounts ──────────────────────────────────────────────────────────

    @Override
    public List<BankAccountResponse> getBankAccounts(String ownerEmail) {
        Owner owner = findOwnerByEmail(ownerEmail);
        return ownerBankAccountRepository.findByOwnerIdOrderByCreatedAtDesc(owner.getId())
                .stream()
                .map(this::mapToBankAccountResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BankAccountResponse addBankAccount(String ownerEmail, CreateBankAccountRequest request) {
        Owner owner = findOwnerByEmail(ownerEmail);

        // Đếm số lượng bank account hiện tại để set isDefault
        List<OwnerBankAccount> existingAccounts = ownerBankAccountRepository.findByOwnerIdOrderByCreatedAtDesc(owner.getId());
        boolean isDefault = existingAccounts.isEmpty();

        OwnerBankAccount newAccount = OwnerBankAccount.builder()
                .owner(owner)
                .bankCode(request.getBankCode())
                .bankName(request.getBankName())
                .bankLogo(request.getBankLogo())
                .accountNumber(request.getAccountNumber())
                .accountName(request.getAccountName())
                .isDefault(isDefault)
                .build();

        newAccount = ownerBankAccountRepository.save(newAccount);
        log.info("Bank account added: ownerId={}, accountId={}", owner.getId(), newAccount.getId());
        return mapToBankAccountResponse(newAccount);
    }

    @Override
    @Transactional
    public void deleteBankAccount(String ownerEmail, UUID bankAccountId) {
        Owner owner = findOwnerByEmail(ownerEmail);
        OwnerBankAccount account = ownerBankAccountRepository.findById(bankAccountId)
                .orElseThrow(() -> new CustomException("Không tìm thấy tài khoản ngân hàng", 404));

        if (!account.getOwner().getId().equals(owner.getId())) {
            throw new CustomException("Bạn không có quyền xóa tài khoản này", 403);
        }

        ownerBankAccountRepository.delete(account);
        log.info("Bank account deleted: ownerId={}, accountId={}", owner.getId(), bankAccountId);

        // Nếu tài khoản vừa xóa là mặc định, set lại default cho tài khoản khác (nếu có)
        if (Boolean.TRUE.equals(account.getIsDefault())) {
            List<OwnerBankAccount> remaining = ownerBankAccountRepository.findByOwnerIdOrderByCreatedAtDesc(owner.getId());
            if (!remaining.isEmpty()) {
                OwnerBankAccount first = remaining.get(0);
                first.setIsDefault(true);
                ownerBankAccountRepository.save(first);
            }
        }
    }

    private BankAccountResponse mapToBankAccountResponse(OwnerBankAccount account) {
        return BankAccountResponse.builder()
                .id(account.getId())
                .bankCode(account.getBankCode())
                .bankName(account.getBankName())
                .bankLogo(account.getBankLogo())
                .accountNumber(account.getAccountNumber())
                .accountName(account.getAccountName())
                .isDefault(account.getIsDefault())
                .createdAt(account.getCreatedAt())
                .build();
    }
}
