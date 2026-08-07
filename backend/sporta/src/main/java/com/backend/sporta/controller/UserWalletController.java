package com.backend.sporta.controller;

import com.backend.sporta.dto.*;
import com.backend.sporta.service.UserWalletService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller cho Ví người dùng (Mobile App).
 * Cung cấp API nạp tiền, xem số dư, thanh toán booking bằng ví.
 */
@RestController
@RequestMapping("/api/v1/wallet")
@CrossOrigin(origins = "*")
public class UserWalletController {

    @Autowired
    private UserWalletService userWalletService;

    /**
     * GET /api/v1/wallet/balance
     * Xem số dư ví hiện tại.
     */
    @GetMapping("/balance")
    public ResponseEntity<WalletBalanceResponse> getBalance() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        WalletBalanceResponse response = userWalletService.getBalance(email);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/v1/wallet/top-up
     * Tạo link nạp tiền qua PayOS. Trả về checkoutUrl + QR cho Mobile.
     */
    @PostMapping("/top-up")
    public ResponseEntity<TopUpResponse> topUp(@Valid @RequestBody TopUpRequest request) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            TopUpResponse response = userWalletService.initiateTopUp(email, request);
            return ResponseEntity.ok(response);
        } catch (Throwable t) {
            try {
                java.io.PrintWriter pw = new java.io.PrintWriter(new java.io.FileWriter("error.log", true));
                pw.println("ERROR OCCURRED IN TOPUP API: " + new java.util.Date());
                t.printStackTrace(pw);
                pw.println("==================================================");
                pw.close();
            } catch (Exception ex) {}
            throw t;
        }
    }

    /**
     * POST /api/v1/wallet/pay-booking
     * Thanh toán booking bằng ví (có ưu đãi giảm giá ví).
     */
    @PostMapping("/pay-booking")
    public ResponseEntity<BookingResponse> payBookingWithWallet(
            @Valid @RequestBody WalletPayBookingRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        BookingResponse response = userWalletService.payBookingWithWallet(email, request);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/wallet/transactions
     * Lịch sử giao dịch ví (phân trang).
     */
    @GetMapping("/transactions")
    public ResponseEntity<List<WalletTransactionResponse>> getTransactionHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<WalletTransactionResponse> response = userWalletService.getTransactionHistory(email, page, size);
        return ResponseEntity.ok(response);
    }
}
