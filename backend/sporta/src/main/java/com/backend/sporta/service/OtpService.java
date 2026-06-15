package com.backend.sporta.service;

import com.backend.sporta.entity.OtpRecord;
import com.backend.sporta.exception.CustomException;
import com.backend.sporta.repository.OtpRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class OtpService {

    @Autowired
    private OtpRecordRepository otpRecordRepository;

    private static final int OTP_EXPIRATION_MINUTES = 5;
    private static final int RESEND_COOLDOWN_SECONDS = 60;
    private static final int MAX_ATTEMPTS_PER_15_MINS = 5;

    public String generateAndSaveOtp(String email) {
        Optional<OtpRecord> existingOtpOpt = otpRecordRepository.findByEmail(email);
        OtpRecord otpRecord;

        LocalDateTime now = LocalDateTime.now();

        if (existingOtpOpt.isPresent()) {
            otpRecord = existingOtpOpt.get();

            // Check 60s cooldown
            if (otpRecord.getLastSentAt().plusSeconds(RESEND_COOLDOWN_SECONDS).isAfter(now)) {
                throw new CustomException("Vui lòng đợi 60 giây trước khi yêu cầu mã mới.", 429);
            }

            // Check max 5 attempts in 15 mins
            if (otpRecord.getLastSentAt().plusMinutes(15).isAfter(now)) {
                if (otpRecord.getAttemptCount() >= MAX_ATTEMPTS_PER_15_MINS) {
                    throw new CustomException("Bạn đã yêu cầu mã quá nhiều lần. Vui lòng thử lại sau 15 phút.", 429);
                }
                otpRecord.setAttemptCount(otpRecord.getAttemptCount() + 1);
            } else {
                // Reset attempts if it's been more than 15 mins
                otpRecord.setAttemptCount(1);
            }
        } else {
            otpRecord = new OtpRecord();
            otpRecord.setEmail(email);
            otpRecord.setAttemptCount(1);
        }

        String otpCode = String.format("%06d", new Random().nextInt(999999));
        
        otpRecord.setOtpCode(otpCode);
        otpRecord.setExpiresAt(now.plusMinutes(OTP_EXPIRATION_MINUTES));
        otpRecord.setLastSentAt(now);

        otpRecordRepository.save(otpRecord);
        return otpCode;
    }

    public boolean verifyOtp(String email, String otpCode) {
        OtpRecord otpRecord = otpRecordRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("Không tìm thấy yêu cầu OTP cho email này.", 404));

        if (otpRecord.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new CustomException("Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.", 400);
        }

        if (!otpRecord.getOtpCode().equals(otpCode)) {
            throw new CustomException("Mã OTP không chính xác.", 400);
        }

        // OTP is valid, clear it or leave it to expire (we clear it)
        otpRecordRepository.delete(otpRecord);
        return true;
    }
}
