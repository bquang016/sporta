package com.backend.sporta.controller;

import com.backend.sporta.dto.AdminWithdrawalActionRequest;
import com.backend.sporta.dto.WithdrawalResponse;
import com.backend.sporta.service.OwnerWalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller cho Admin quản lý yêu cầu rút tiền của Owner.
 * Admin duyệt hoặc từ chối sau khi đã chuyển khoản thủ công.
 */
@RestController
@RequestMapping("/api/v1/admin/withdrawals")
@CrossOrigin(origins = "*")
public class AdminWithdrawalController {

    @Autowired
    private OwnerWalletService ownerWalletService;

    /**
     * GET /api/v1/admin/withdrawals
     * Lấy danh sách yêu cầu rút tiền (filter theo status).
     */
    @GetMapping
    public ResponseEntity<List<WithdrawalResponse>> getWithdrawals(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<WithdrawalResponse> response;
        if (status != null && !status.isEmpty()) {
            response = ownerWalletService.getWithdrawalsByStatus(status, page, size);
        } else {
            response = ownerWalletService.getAllWithdrawals(page, size);
        }
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/v1/admin/withdrawals/{id}/approve
     * Duyệt yêu cầu rút tiền (sau khi Admin đã chuyển khoản thủ công).
     */
    @PutMapping("/{id}/approve")
    public ResponseEntity<WithdrawalResponse> approveWithdrawal(
            @PathVariable UUID id,
            @RequestBody(required = false) AdminWithdrawalActionRequest request) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        String note = request != null ? request.getNote() : null;
        WithdrawalResponse response = ownerWalletService.approveWithdrawal(id, adminEmail, note);
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/v1/admin/withdrawals/{id}/reject
     * Từ chối yêu cầu rút tiền → hoàn lại balance cho Owner.
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<WithdrawalResponse> rejectWithdrawal(
            @PathVariable UUID id,
            @RequestBody AdminWithdrawalActionRequest request) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        WithdrawalResponse response = ownerWalletService.rejectWithdrawal(id, adminEmail, request.getNote());
        return ResponseEntity.ok(response);
    }
}
