package com.backend.sporta.controller;

import com.backend.sporta.enums.PaymentTransactionStatus;
import com.backend.sporta.service.PaymentServiceImpl;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.payos.PayOS;
import vn.payos.model.webhooks.WebhookData;

import java.util.Map;

/**
 * Webhook endpoint cho PayOS gọi khi có kết quả thanh toán.
 * KHÔNG cần JWT (permitAll trong SecurityConfig).
 */
@RestController
@RequestMapping("/api/v1/webhooks")
@Slf4j
public class PayOSWebhookController {

    @Autowired
    private PayOS payOS;

    @Autowired
    private PaymentServiceImpl paymentService;

    /**
     * POST /api/v1/webhooks/payos
     * Nhận và xử lý webhook từ PayOS.
     * 1. Verify chữ ký (signature) bằng PayOS SDK
     * 2. Cập nhật PaymentTransaction
     * 3. Publish event cho các module khác
     */
    @PostMapping("/payos")
    public ResponseEntity<?> handlePayOSWebhook(@RequestBody ObjectNode body) {
        try {
            log.info("Received PayOS webhook: {}", body.toString());

            // Verify signature và parse dữ liệu
            WebhookData webhookData = payOS.webhooks().verify(body);

            long orderCode = webhookData.getOrderCode();
            String code = webhookData.getCode();

            // code "00" = thành công, các mã khác = thất bại
            if ("00".equals(code)) {
                paymentService.handleWebhookSuccess(orderCode);
                log.info("PayOS webhook processed successfully: orderCode={}", orderCode);
            } else {
                paymentService.handleWebhookFailure(orderCode, PaymentTransactionStatus.FAILED);
                log.warn("PayOS webhook - payment failed: orderCode={}, code={}", orderCode, code);
            }

            // PayOS yêu cầu trả về 200 OK
            return ResponseEntity.ok(Map.of("success", true));

        } catch (Exception e) {
            log.error("PayOS webhook verification failed: {}", e.getMessage(), e);
            return ResponseEntity.ok(Map.of("success", false, "message", "Webhook verification failed"));
        }
    }
}
