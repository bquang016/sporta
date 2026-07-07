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
            // TẠM THỜI MOCK GỬI EMAIL ĐỂ TRÁNH LỖI GMAIL POLICY
            System.out.println("\n=================================================");
            System.out.println("🔔 [MOCK EMAIL] XÁC THỰC TÀI KHOẢN");
            System.out.println("Gửi đến: " + toEmail);
            System.out.println("Mã OTP của bạn là: " + otpCode);
            System.out.println("=================================================\n");
            
            /* CỐT CODE GỐC (Dùng khi triển khai thật)
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("SPORTA - Xác thực tài khoản của bạn");

            String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>"
                    +
                    "<h2 style='text-align: center; color: #4CAF50;'>SPORTA</h2>" +
                    "<h3 style='text-align: center;'>XÁC THỰC TÀI KHOẢN CỦA BẠN</h3>" +
                    "<p>Xin chào Bạn,</p>" +
                    "<p>Cảm ơn bạn đã tham gia Sporta! Để hoàn tất việc đăng ký và bảo mật tài khoản, vui lòng sử dụng mã OTP dưới đây:</p>"
                    +
                    "<div style='background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; font-size: 24px; letter-spacing: 5px; font-weight: bold;'>"
                    +
                    otpCode +
                    "</div>" +
                    "<p>Mã OTP này có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>" +
                    "<hr style='border-top: 1px solid #eee;' />" +
                    "<p style='text-align: center; font-size: 12px; color: #888;'>© 2024 Sporta, Inc. Tất cả quyền được bảo lưu.</p>"
                    +
                    "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
            */
        } catch (Exception e) {
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }

    /**
     * Send an email notifying the owner that their registration has been approved.
     * Includes login credentials (email + temporary password).
     */
    public void sendAccountApprovedEmail(String toEmail, String temporaryPassword) {
        try {
            // TẠM THỜI MOCK GỬI EMAIL ĐỂ TRÁNH LỖI GMAIL POLICY
            System.out.println("\n=================================================");
            System.out.println("🎉 [MOCK EMAIL] TÀI KHOẢN ĐÃ ĐƯỢC KÍCH HOẠT");
            System.out.println("Gửi đến: " + toEmail);
            System.out.println("Mật khẩu tạm thời: " + temporaryPassword);
            System.out.println("=================================================\n");
            
            /* CỐT CODE GỐC (Dùng khi triển khai thật)
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("SPORTA - Tài khoản của bạn đã được kích hoạt 🎉");

            String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 0; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;'>"
                    // Header banner
                    + "<div style='background: linear-gradient(135deg, #003527, #064E3B); padding: 30px 20px; text-align: center;'>"
                    + "<h1 style='color: #FACC15; margin: 0; font-size: 28px; letter-spacing: 2px;'>SPORTA</h1>"
                    + "<p style='color: rgba(255,255,255,0.7); margin: 5px 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 3px;'>Owner Portal</p>"
                    + "</div>"
                    // Body
                    + "<div style='padding: 30px 25px;'>"
                    + "<h2 style='color: #064E3B; margin: 0 0 10px; font-size: 20px;'>🎉 Chúc mừng! Đơn đăng ký đã được duyệt</h2>"
                    + "<p style='color: #555; font-size: 14px; line-height: 1.6;'>Xin chào,</p>"
                    + "<p style='color: #555; font-size: 14px; line-height: 1.6;'>Chúng tôi vui mừng thông báo rằng hồ sơ đăng ký chủ sân của bạn đã được <strong style='color: #064E3B;'>xét duyệt thành công</strong>. "
                    + "Dưới đây là thông tin đăng nhập của bạn:</p>"
                    // Credentials box
                    + "<div style='background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0;'>"
                    + "<table style='width: 100%; border-collapse: collapse;'>"
                    + "<tr><td style='padding: 8px 0; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;'>Email đăng nhập</td></tr>"
                    + "<tr><td style='padding: 0 0 15px; color: #064E3B; font-size: 16px; font-weight: bold;'>" + toEmail + "</td></tr>"
                    + "<tr><td style='padding: 8px 0; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;'>Mật khẩu tạm thời</td></tr>"
                    + "<tr><td style='padding: 0; color: #064E3B; font-size: 18px; font-weight: bold; letter-spacing: 2px; font-family: monospace;'>" + temporaryPassword + "</td></tr>"
                    + "</table>"
                    + "</div>"
                    // Warning
                    + "<div style='background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 15px; margin: 15px 0;'>"
                    + "<p style='margin: 0; color: #92400e; font-size: 13px; font-weight: bold;'>⚠️ Lưu ý quan trọng</p>"
                    + "<p style='margin: 5px 0 0; color: #92400e; font-size: 13px;'>Bạn sẽ được yêu cầu <strong>đổi mật khẩu</strong> trong lần đăng nhập đầu tiên. "
                    + "Vui lòng không chia sẻ thông tin đăng nhập này với bất kỳ ai.</p>"
                    + "</div>"
                    + "<p style='color: #555; font-size: 14px; line-height: 1.6;'>Hãy đăng nhập vào hệ thống quản lý và bắt đầu quản lý cụm sân của bạn ngay!</p>"
                    + "</div>"
                    // Footer
                    + "<div style='background-color: #f9fafb; padding: 15px 25px; border-top: 1px solid #e0e0e0; text-align: center;'>"
                    + "<p style='margin: 0; color: #9ca3af; font-size: 11px;'>© 2026 Sporta, Inc. Tất cả quyền được bảo lưu.</p>"
                    + "</div>"
                    + "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
            */
        } catch (Exception e) {
            throw new RuntimeException("Failed to send account approved email", e);
        }
    }
}
