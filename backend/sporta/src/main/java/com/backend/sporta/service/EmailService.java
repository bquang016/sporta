package com.backend.sporta.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otpCode) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("SPORTA - Xác thực tài khoản của bạn");

            String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>" +
                    "<h2 style='text-align: center; color: #4CAF50;'>SPORTA</h2>" +
                    "<h3 style='text-align: center;'>XÁC THỰC TÀI KHOẢN CỦA BẠN</h3>" +
                    "<p>Xin chào Bạn,</p>" +
                    "<p>Cảm ơn bạn đã tham gia Sporta! Để hoàn tất việc đăng ký và bảo mật tài khoản, vui lòng sử dụng mã OTP dưới đây:</p>" +
                    "<div style='background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; font-size: 24px; letter-spacing: 5px; font-weight: bold;'>" +
                    otpCode +
                    "</div>" +
                    "<p>Mã OTP này có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>" +
                    "<hr style='border-top: 1px solid #eee;' />" +
                    "<p style='text-align: center; font-size: 12px; color: #888;'>© 2024 Sporta, Inc. Tất cả quyền được bảo lưu.</p>" +
                    "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }
}
