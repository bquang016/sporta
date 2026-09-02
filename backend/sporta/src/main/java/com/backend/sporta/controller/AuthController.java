package com.backend.sporta.controller;

import com.backend.sporta.dto.AuthResponse;
import com.backend.sporta.dto.ChangePasswordRequest;
import com.backend.sporta.dto.SnoozeChangePasswordRequest;
import com.backend.sporta.dto.LoginRequest;
import com.backend.sporta.dto.RegisterRequest;
import com.backend.sporta.dto.SendOtpRequest;
import com.backend.sporta.dto.VerifyOtpRequest;
import com.backend.sporta.dto.VerifyOtpResponse;
import com.backend.sporta.dto.GoogleLoginRequest;
import com.backend.sporta.dto.GoogleLoginResponse;
import com.backend.sporta.dto.RegisterOwnerResponse;
import com.backend.sporta.service.AuthService;
import com.backend.sporta.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*") // Configure based on actual frontend domain
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        authService.sendOtp(request);
        return ResponseEntity.ok(Map.of("message", "Mã OTP đã được gửi đến email của bạn."));
    }

    @PostMapping("/send-otp-contract")
    public ResponseEntity<?> sendOtpContract(@Valid @RequestBody SendOtpRequest request) {
        authService.sendOtpForContract(request);
        return ResponseEntity.ok(Map.of("message", "Mã OTP xác thực hợp đồng đã được gửi đến email của bạn."));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<VerifyOtpResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        VerifyOtpResponse response = authService.verifyOtp(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/register-owner", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RegisterOwnerResponse> registerOwner(
            @RequestParam("registrationToken") String registrationToken,
            @RequestParam("fullName") String fullName,
            @RequestParam("idNumber") String idNumber,
            @RequestParam(value = "gender", required = false, defaultValue = "") String gender,
            @RequestParam(value = "nationality", required = false, defaultValue = "Việt Nam") String nationality,
            @RequestParam(value = "hometown", required = false, defaultValue = "") String hometown,
            @RequestParam(value = "permanentAddress", required = false, defaultValue = "") String permanentAddress,
            @RequestParam(value = "phoneNumber", required = false, defaultValue = "") String phoneNumber,
            @RequestParam("venueName") String venueName,
            @RequestParam("province") String province,
            @RequestParam("district") String district,
            @RequestParam("ward") String ward,
            @RequestParam(value = "addressDetail", required = false, defaultValue = "") String addressDetail,
            @RequestParam("sportId") Long sportId,
            @RequestParam(value = "openingTime", required = false) String openingTimeStr,
            @RequestParam(value = "closingTime", required = false) String closingTimeStr,
            @RequestParam(value = "shiftDurationMinutes", required = false, defaultValue = "60") Integer shiftDurationMinutes,
            @RequestParam(value = "hasSurcharge", required = false, defaultValue = "false") Boolean hasSurcharge,
            @RequestParam(value = "surchargeAmount", required = false) Double surchargeAmount,
            @RequestParam(value = "surchargeDescription", required = false) String surchargeDescription,
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude,
            @RequestParam("subCourtCount") int subCourtCount,
            @RequestParam(value = "description", required = false, defaultValue = "") String description,
            @RequestParam(value = "courts", required = false, defaultValue = "[]") String courts,
            @RequestParam(value = "freeCancellationHours", required = false) Integer freeCancellationHours,
            @RequestParam(value = "lateCancellationRefundRate", required = false) Integer lateCancellationRefundRate,
            @RequestParam(value = "rainRescheduleAllowed", required = false) Boolean rainRescheduleAllowed,
            @RequestParam(value = "idFrontImage", required = false) org.springframework.web.multipart.MultipartFile idFrontImage,
            @RequestParam(value = "idBackImage", required = false) org.springframework.web.multipart.MultipartFile idBackImage,
            @RequestParam(required = false) String coverImage,
            @RequestParam(required = false) String registrationImages,
            @RequestParam(required = false) Boolean isContractSigned,
            @RequestParam(required = false) String signatureTimestamp,
            @RequestParam(required = false) String signatureIp) {

        java.time.LocalTime openingTime = openingTimeStr != null && !openingTimeStr.isEmpty()
                ? java.time.LocalTime.parse(openingTimeStr)
                : java.time.LocalTime.of(5, 0);
        java.time.LocalTime closingTime = closingTimeStr != null && !closingTimeStr.isEmpty()
                ? java.time.LocalTime.parse(closingTimeStr)
                : java.time.LocalTime.of(22, 0);

        RegisterOwnerResponse response = authService.registerOwner(
                registrationToken, fullName, idNumber, gender, nationality, hometown, permanentAddress, phoneNumber,
                venueName, province, district, ward, addressDetail, sportId, openingTime, closingTime, shiftDurationMinutes, hasSurcharge,
                surchargeAmount, surchargeDescription, latitude, longitude, subCourtCount, description,
                courts, freeCancellationHours, lateCancellationRefundRate, rainRescheduleAllowed, idFrontImage,
                idBackImage, coverImage, registrationImages, isContractSigned, signatureTimestamp, signatureIp);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/google-login")
    public ResponseEntity<GoogleLoginResponse> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        GoogleLoginResponse response = authService.googleLogin(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        authService.logout(authHeader);
        return ResponseEntity.ok(Map.of("message", "Đăng xuất thành công và phiên làm việc đã được xóa."));
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CHANGE PASSWORD (First-login forced change or voluntary)
    // ═══════════════════════════════════════════════════════════════════════════

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(authHeader, request);
        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công."));
    }

    @PostMapping("/snooze-change-password")
    public ResponseEntity<?> snoozeChangePassword(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody SnoozeChangePasswordRequest request) {
        authService.snoozeChangePassword(authHeader, request);
        return ResponseEntity.ok(Map.of("message", "Đã tạm hoãn nhắc nhở đổi mật khẩu."));
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ADMIN — Approve / Reject Owner Registration
    // ═══════════════════════════════════════════════════════════════════════════

    @PostMapping("/admin/approve-registration/{id}")
    public ResponseEntity<?> approveRegistration(@PathVariable UUID id) {
        authService.approveOwnerRegistration(id);
        return ResponseEntity
                .ok(Map.of("message", "Đơn đăng ký đã được duyệt thành công. Email thông báo đã được gửi."));
    }

    @PostMapping("/admin/reject-registration/{id}")
    public ResponseEntity<?> rejectRegistration(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.getOrDefault("reason", "") : "";
        authService.rejectOwnerRegistration(id, reason);
        return ResponseEntity.ok(Map.of("message", "Đơn đăng ký đã bị từ chối."));
    }

    @GetMapping("/ping")
    public ResponseEntity<?> ping() {
        return ResponseEntity.ok(Map.of("status", "UP", "timestamp", System.currentTimeMillis()));
    }
}
