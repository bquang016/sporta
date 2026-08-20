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

import com.backend.sporta.entity.User;
import com.backend.sporta.exception.CustomException;
import com.backend.sporta.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.List;
import java.util.UUID;

@RestController
public class UserVoucherController {

    @Autowired
    private VoucherService voucherService;

    @Autowired
    private UserRepository userRepository;

    private Long resolveUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (email == null || "anonymousUser".equalsIgnoreCase(email)) {
            throw new CustomException("Vui lòng đăng nhập để thực hiện", 401);
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));
        return user.getId();
    }

    @PostMapping({"/api/v1/user/vouchers/collect", "/api/user/vouchers/collect"})
    public ResponseEntity<UserVoucherResponse> collectVoucher(
            @Valid @RequestBody CollectVoucherRequest request) {
        Long currentUserId = resolveUserId();
        return ResponseEntity.ok(voucherService.collectVoucher(currentUserId, request.getVoucherId()));
    }

    @PostMapping({"/api/v1/user/vouchers/collect-by-code", "/api/user/vouchers/collect-by-code"})
    public ResponseEntity<UserVoucherResponse> collectVoucherByCode(
            @RequestBody java.util.Map<String, String> request) {
        Long currentUserId = resolveUserId();
        String code = request.get("voucherCode") != null ? request.get("voucherCode") : request.get("code");
        return ResponseEntity.ok(voucherService.collectVoucherByCode(currentUserId, code));
    }

    @GetMapping({"/api/v1/user/vouchers", "/api/user/vouchers"})
    public ResponseEntity<List<UserVoucherResponse>> getUserVouchers(
            @RequestParam(required = false) String status) {
        Long currentUserId = resolveUserId();
        UserVoucherStatus voucherStatus = null;
        if (status != null && !status.trim().isEmpty()) {
            if ("ACTIVE".equalsIgnoreCase(status) || "COLLECTED".equalsIgnoreCase(status)) {
                voucherStatus = UserVoucherStatus.COLLECTED;
            } else if ("USED".equalsIgnoreCase(status)) {
                voucherStatus = UserVoucherStatus.USED;
            } else if ("EXPIRED".equalsIgnoreCase(status)) {
                voucherStatus = UserVoucherStatus.EXPIRED;
            }
        }
        return ResponseEntity.ok(voucherService.getUserVouchers(currentUserId, voucherStatus));
    }

    @PostMapping({"/api/v1/user/vouchers/apply", "/api/user/vouchers/apply"})
    public ResponseEntity<ApplyVoucherResponse> previewApplyVoucher(
            @Valid @RequestBody ApplyVoucherRequest request) {
        Long currentUserId = resolveUserId();
        return ResponseEntity.ok(voucherService.previewApplyVouchers(request, currentUserId));
    }

    @GetMapping({"/api/v1/public/vouchers/banners", "/api/public/vouchers/banners"})
    public ResponseEntity<List<VoucherResponse>> getBannerVouchers() {
        return ResponseEntity.ok(voucherService.getActiveBannerVouchers());
    }

    @GetMapping({"/api/v1/public/vouchers/explore", "/api/public/vouchers/explore"})
    public ResponseEntity<List<VoucherResponse>> getExploreVouchers(
            @RequestParam(required = false) String scope) {
        com.backend.sporta.enums.VoucherScope voucherScope = null;
        if ("SYSTEM".equalsIgnoreCase(scope)) {
            voucherScope = com.backend.sporta.enums.VoucherScope.SYSTEM;
        } else if ("VENUE".equalsIgnoreCase(scope) || "OWNER".equalsIgnoreCase(scope)) {
            voucherScope = com.backend.sporta.enums.VoucherScope.VENUE;
        }
        return ResponseEntity.ok(voucherService.getExploreVouchers(voucherScope));
    }
}
