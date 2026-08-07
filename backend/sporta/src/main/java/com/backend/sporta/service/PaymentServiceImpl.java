package com.backend.sporta.service;

import com.backend.sporta.dto.CreatePaymentResponse;
import com.backend.sporta.dto.PaymentTransactionResponse;
import com.backend.sporta.entity.PaymentTransaction;
import com.backend.sporta.enums.PaymentTransactionStatus;
import com.backend.sporta.enums.PaymentTransactionType;
import com.backend.sporta.event.PaymentCompletedEvent;
import com.backend.sporta.exception.CustomException;
import com.backend.sporta.repository.PaymentTransactionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLinkItem;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private PayOS payOS;

    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Value("${payos.return-url:sporta://payment/success}")
    private String returnUrl;

    @Value("${payos.cancel-url:sporta://payment/cancel}")
    private String cancelUrl;

    /**
     * Sinh orderCode unique dựa trên timestamp + random.
     * PayOS yêu cầu orderCode là Long, unique trên toàn hệ thống.
     */
    private long generateOrderCode() {
        long code = System.currentTimeMillis() % 1_000_000_000L * 10
                   + (long) (Math.random() * 10);
        while (paymentTransactionRepository.existsByOrderCode(code)) {
            code = System.currentTimeMillis() % 1_000_000_000L * 10
                   + (long) (Math.random() * 10);
        }
        return code;
    }

    @Override
    public CreatePaymentResponse createPaymentLink(Long userId, Long amount,
                                                    PaymentTransactionType type, String description,
                                                    String referenceType, UUID referenceId) {
        if (amount < 10000) {
            throw new CustomException("Số tiền tối thiểu là 10,000 VNĐ", 400);
        }

        long orderCode = generateOrderCode();
        String desc = description != null ? description : "Sporta - " + type.name();

        // PayOS giới hạn description tối đa 25 ký tự
        String payosDesc = desc.length() > 25 ? desc.substring(0, 25) : desc;

        try {
            // Tạo item data cho PayOS
            PaymentLinkItem itemData = PaymentLinkItem.builder()
                    .name(desc)
                    .quantity(1)
                    .price(amount)
                    .build();

            // Tạo payment link request
            CreatePaymentLinkRequest paymentRequest = CreatePaymentLinkRequest.builder()
                    .orderCode(orderCode)
                    .amount(amount)
                    .description(payosDesc)
                    .returnUrl(returnUrl)
                    .cancelUrl(cancelUrl)
                    .item(itemData)
                    .build();

            // Gọi PayOS API tạo link thanh toán
            log.info("Calling PayOS API... orderCode={}, amount={}", orderCode, amount);
            CreatePaymentLinkResponse response = payOS.paymentRequests().create(paymentRequest);
            log.info("PayOS API returned successfully. checkoutUrl={}", response.getCheckoutUrl());

            // Lưu vào DB
            PaymentTransaction transaction = PaymentTransaction.builder()
                    .userId(userId)
                    .orderCode(orderCode)
                    .transactionType(type)
                    .amount(amount)
                    .status(PaymentTransactionStatus.PENDING)
                    .referenceType(referenceType)
                    .referenceId(referenceId)
                    .payosCheckoutUrl(response.getCheckoutUrl())
                    .payosQrCode(response.getQrCode())
                    .description(desc)
                    .build();

            paymentTransactionRepository.save(transaction);

            log.info("Created PayOS payment link: orderCode={}, amount={}, type={}, userId={}",
                    orderCode, amount, type, userId);

            return CreatePaymentResponse.builder()
                    .orderCode(orderCode)
                    .checkoutUrl(response.getCheckoutUrl())
                    .qrCode(response.getQrCode())
                    .amount(amount)
                    .description(desc)
                    .build();

        } catch (Exception e) {
            log.error("Failed to create PayOS payment link: {}", e.getMessage(), e);
            throw new CustomException("Không thể tạo link thanh toán. Vui lòng thử lại.", 500);
        }
    }

    @Override
    public PaymentTransaction getByOrderCode(Long orderCode) {
        return paymentTransactionRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new CustomException("Không tìm thấy giao dịch", 404));
    }

    @Override
    public PaymentTransactionResponse getTransactionStatus(Long orderCode) {
        PaymentTransaction txn = getByOrderCode(orderCode);
        
        // Cập nhật trạng thái từ PayOS nếu đang PENDING (đặc biệt hữu ích khi test localhost vì webhook không tới được)
        if (txn.getStatus() == PaymentTransactionStatus.PENDING) {
            try {
                vn.payos.model.v2.paymentRequests.PaymentLink paymentLink = payOS.paymentRequests().get(String.valueOf(orderCode));
                vn.payos.model.v2.paymentRequests.PaymentLinkStatus payosStatus = paymentLink.getStatus();
                
                if (vn.payos.model.v2.paymentRequests.PaymentLinkStatus.PAID == payosStatus) {
                    handleWebhookSuccess(orderCode);
                    txn = getByOrderCode(orderCode); // Refresh from DB
                } else if (vn.payos.model.v2.paymentRequests.PaymentLinkStatus.CANCELLED == payosStatus) {
                    handleWebhookFailure(orderCode, PaymentTransactionStatus.CANCELLED);
                    txn = getByOrderCode(orderCode);
                } else if (vn.payos.model.v2.paymentRequests.PaymentLinkStatus.FAILED == payosStatus) {
                    handleWebhookFailure(orderCode, PaymentTransactionStatus.FAILED);
                    txn = getByOrderCode(orderCode);
                }
            } catch (Exception e) {
                log.error("Failed to sync payment status with PayOS for orderCode={}", orderCode, e);
            }
        }
        
        return mapToResponse(txn);
    }

    @Override
    public List<PaymentTransactionResponse> getUserTransactions(Long userId, int page, int size) {
        return paymentTransactionRepository
                .findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size))
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ─── Webhook Processing ─────────────────────────────────────────────────────

    /**
     * Xử lý webhook từ PayOS khi thanh toán thành công.
     * Cập nhật trạng thái và publish event cho các module khác.
     */
    @Transactional
    public void handleWebhookSuccess(Long orderCode) {
        PaymentTransaction txn = paymentTransactionRepository.findByOrderCode(orderCode)
                .orElse(null);

        if (txn == null) {
            log.warn("Webhook received for unknown orderCode: {}", orderCode);
            return;
        }

        // Idempotency: nếu đã COMPLETED thì bỏ qua
        if (txn.getStatus() == PaymentTransactionStatus.COMPLETED) {
            log.info("Webhook duplicate for orderCode={}, already COMPLETED", orderCode);
            return;
        }

        txn.setStatus(PaymentTransactionStatus.COMPLETED);
        paymentTransactionRepository.save(txn);

        log.info("Payment completed: orderCode={}, amount={}, type={}",
                orderCode, txn.getAmount(), txn.getTransactionType());

        // Publish event cho Module 2 (User Wallet)
        eventPublisher.publishEvent(new PaymentCompletedEvent(
                this,
                txn.getOrderCode(),
                txn.getUserId(),
                txn.getAmount(),
                txn.getTransactionType(),
                txn.getReferenceType(),
                txn.getReferenceId()
        ));
    }

    /**
     * Xử lý khi thanh toán thất bại hoặc hủy.
     */
    @Transactional
    public void handleWebhookFailure(Long orderCode, PaymentTransactionStatus failureStatus) {
        PaymentTransaction txn = paymentTransactionRepository.findByOrderCode(orderCode)
                .orElse(null);

        if (txn == null || txn.getStatus() != PaymentTransactionStatus.PENDING) {
            return;
        }

        txn.setStatus(failureStatus);
        paymentTransactionRepository.save(txn);

        log.info("Payment {}: orderCode={}", failureStatus, orderCode);
    }

    // ─── Mapper ─────────────────────────────────────────────────────────────────

    private PaymentTransactionResponse mapToResponse(PaymentTransaction txn) {
        return PaymentTransactionResponse.builder()
                .id(txn.getId())
                .orderCode(txn.getOrderCode())
                .transactionType(txn.getTransactionType())
                .amount(txn.getAmount())
                .status(txn.getStatus())
                .referenceType(txn.getReferenceType())
                .referenceId(txn.getReferenceId())
                .description(txn.getDescription())
                .createdAt(txn.getCreatedAt())
                .build();
    }
}
