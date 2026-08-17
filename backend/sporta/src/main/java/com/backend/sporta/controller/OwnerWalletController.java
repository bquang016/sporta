package com.backend.sporta.controller;

import com.backend.sporta.dto.*;
import com.backend.sporta.service.OwnerWalletService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller cho Ví chủ sân (Web Owner).
 * Cung cấp API xem doanh thu, rút tiền, xem lịch sử.
 */
@RestController
@RequestMapping("/api/v1/owner/wallet")
@CrossOrigin(origins = "*")
public class OwnerWalletController {

    @Autowired
    private OwnerWalletService ownerWalletService;

    /**
     * GET /api/v1/owner/wallet/balance
     * Xem số dư, tổng doanh thu, tổng chiết khấu.
     */
    @GetMapping("/balance")
    public ResponseEntity<OwnerWalletResponse> getBalance() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        OwnerWalletResponse response = ownerWalletService.getBalance(email);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/v1/owner/wallet/withdraw
     * Tạo yêu cầu rút tiền.
     */
    @PostMapping("/withdraw")
    public ResponseEntity<WithdrawalResponse> createWithdrawal(
            @Valid @RequestBody CreateWithdrawalRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        WithdrawalResponse response = ownerWalletService.createWithdrawal(email, request);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/owner/wallet/withdrawals
     * Lịch sử yêu cầu rút tiền (phân trang).
     */
    @GetMapping("/withdrawals")
    public ResponseEntity<List<WithdrawalResponse>> getMyWithdrawals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<WithdrawalResponse> response = ownerWalletService.getMyWithdrawals(email, page, size);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/owner/wallet/transactions
     * Lịch sử giao dịch ví Owner (phân trang).
     */
    @GetMapping("/transactions")
    public ResponseEntity<List<WalletTransactionResponse>> getTransactionHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<WalletTransactionResponse> response = ownerWalletService.getTransactionHistory(email, page, size);
        return ResponseEntity.ok(response);
    }

    // ─── Bank Accounts ──────────────────────────────────────────────────────────

    @GetMapping("/bank-accounts")
    public ResponseEntity<List<BankAccountResponse>> getBankAccounts() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<BankAccountResponse> response = ownerWalletService.getBankAccounts(email);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/bank-accounts")
    public ResponseEntity<BankAccountResponse> addBankAccount(@Valid @RequestBody CreateBankAccountRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        BankAccountResponse response = ownerWalletService.addBankAccount(email, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/bank-accounts/{id}")
    public ResponseEntity<Void> deleteBankAccount(@PathVariable java.util.UUID id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        ownerWalletService.deleteBankAccount(email, id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/bank-accounts/{id}/default")
    public ResponseEntity<Void> setDefaultBankAccount(@PathVariable java.util.UUID id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        ownerWalletService.setDefaultBankAccount(email, id);
        return ResponseEntity.noContent().build();
    }
}
