package com.backend.sporta.controller;

import com.backend.sporta.dto.ApplyVoucherRequest;
import com.backend.sporta.dto.ApplyVoucherResponse;
import com.backend.sporta.dto.CollectVoucherRequest;
import com.backend.sporta.dto.UserVoucherResponse;
import com.backend.sporta.dto.VoucherResponse;
import com.backend.sporta.enums.UserVoucherStatus;
import com.backend.sporta.service.VoucherService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class UserVoucherController {

    @Autowired
    private VoucherService voucherService;

    @PostMapping("/api/user/vouchers/collect")
    public ResponseEntity<UserVoucherResponse> collectVoucher(
            @Valid @RequestBody CollectVoucherRequest request,
            @RequestAttribute("userId") Long userId) {
        return ResponseEntity.ok(voucherService.collectVoucher(userId, request.getVoucherId()));
    }

    @GetMapping("/api/user/vouchers")
    public ResponseEntity<List<UserVoucherResponse>> getUserVouchers(
            @RequestParam(required = false) UserVoucherStatus status,
            @RequestAttribute("userId") Long userId) {
        return ResponseEntity.ok(voucherService.getUserVouchers(userId, status));
    }

    @PostMapping("/api/user/vouchers/apply")
    public ResponseEntity<ApplyVoucherResponse> previewApplyVoucher(
            @Valid @RequestBody ApplyVoucherRequest request) {
        return ResponseEntity.ok(voucherService.previewApplyVouchers(request));
    }

    @GetMapping("/api/public/vouchers/banners")
    public ResponseEntity<List<VoucherResponse>> getBannerVouchers() {
        return ResponseEntity.ok(voucherService.getActiveBannerVouchers());
    }
}
