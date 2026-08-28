package com.backend.sporta.controller;

import com.backend.sporta.dto.PaymentTransactionResponse;
import com.backend.sporta.service.PaymentService;
import com.backend.sporta.repository.UserRepository;
import com.backend.sporta.entity.User;
import com.backend.sporta.exception.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller cho Mobile polling trạng thái giao dịch PayOS.
 */
@RestController
@RequestMapping("/api/v1/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private UserRepository userRepository;

    /**
     * GET /api/v1/payments/{orderCode}
     * Kiểm tra trạng thái giao dịch (dùng cho mobile polling sau khi thanh toán).
     */
    @GetMapping("/{orderCode}")
    public ResponseEntity<PaymentTransactionResponse> getTransactionStatus(@PathVariable Long orderCode) {
        PaymentTransactionResponse response = paymentService.getTransactionStatus(orderCode);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/payments/my
     * Lịch sử giao dịch PayOS của user đang đăng nhập.
     */
    @GetMapping("/my")
    public ResponseEntity<List<PaymentTransactionResponse>> getMyTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));
        List<PaymentTransactionResponse> response = paymentService.getUserTransactions(user.getId(), page, size);
        return ResponseEntity.ok(response);
    }
}
