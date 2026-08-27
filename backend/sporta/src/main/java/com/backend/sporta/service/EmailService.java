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

            helper.setFrom("shethongthethao@gmail.com", "SPORTA System");
            helper.setTo(toEmail);
            helper.setSubject("SPORTA - Mã OTP xác thực của bạn 🔒");

            String htmlContent = "<div style=\"font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px; color: #1e293b;\">"
                    + "<div style=\"background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;\">"
                    // Header Banner
                    + "<div style=\"background: linear-gradient(135deg, #002117 0%, #064E3B 60%, #047857 100%); padding: 32px 28px; text-align: center;\">"
                    + "<h1 style=\"color: #FACC15; margin: 0; font-size: 30px; font-weight: 900; letter-spacing: 3px;\">SPORTA</h1>"
                    + "<p style=\"color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;\">Xác Thực Mã OTP Bảo Mật</p>"
                    + "</div>"
                    // Body Content
                    + "<div style=\"padding: 32px 28px; text-align: center;\">"
                    + "<h2 style=\"color: #064E3B; margin: 0 0 8px; font-size: 20px; font-weight: 800;\">Mã Xác Thực OTP Của Bạn</h2>"
                    + "<p style=\"color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px;\">"
                    + "Cảm ơn bạn đã lựa chọn <strong>SPORTA</strong>! Vui lòng sử dụng mã OTP gồm 6 chữ số dưới đây để hoàn tất xác thực:"
                    + "</p>"
                    // OTP Box
                    + "<div style=\"background: linear-gradient(180deg, #ecfdf5 0%, #ffffff 100%); border: 2px solid #059669; border-radius: 14px; padding: 18px 24px; margin: 0 auto 24px; max-width: 320px; box-shadow: 0 4px 14px rgba(5,150,105,0.12);\">"
                    + "<span style=\"font-size: 34px; font-weight: 900; color: #064E3B; letter-spacing: 12px; font-family: 'Courier New', Courier, monospace; display: block;\">"
                    + otpCode
                    + "</span>"
                    + "</div>"
                    // Expiration Note
                    + "<p style=\"color: #64748b; font-size: 13px; margin: 0 0 20px; line-height: 1.5;\">"
                    + "⏱️ Mã OTP này có hiệu lực trong <strong style=\"color: #064E3B;\">5 phút</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai."
                    + "</p>"
                    + "<hr style=\"border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;\" />"
                    + "<p style=\"color: #94a3b8; font-size: 11.5px; margin: 0;\">"
                    + "Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email hoặc liên hệ với bộ phận hỗ trợ SPORTA."
                    + "</p>"
                    + "</div>"
                    // Footer
                    + "<div style=\"background-color: #f8fafc; padding: 18px 28px; border-top: 1px solid #e2e8f0; text-align: center;\">"
                    + "<p style=\"margin: 0; color: #94a3b8; font-size: 11px;\">© 2026 Sporta, Inc. Tất cả các quyền được bảo lưu.</p>"
                    + "</div>"
                    + "</div>"
                    + "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send OTP email: " + e.getMessage(), e);
        }
    }

    /**
     * Send an email notifying the owner that their registration has been approved.
     * Includes login credentials (email + temporary password).
     */
    public void sendAccountApprovedEmail(String toEmail, String temporaryPassword) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("shethongthethao@gmail.com", "SPORTA Owner Portal");
            helper.setTo(toEmail);
            helper.setSubject("SPORTA - Tài khoản Chủ sân của bạn đã được kích hoạt 🎉");

            String htmlContent = "<div style=\"font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px; color: #1e293b;\">"
                    + "<div style=\"background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;\">"
                    // Header banner
                    + "<div style=\"background: linear-gradient(135deg, #002117 0%, #064E3B 60%, #047857 100%); padding: 36px 28px; text-align: center;\">"
                    + "<div style=\"display: inline-block; background: rgba(250,204,21,0.15); padding: 6px 16px; border-radius: 20px; border: 1px solid rgba(250,204,21,0.3); margin-bottom: 12px;\">"
                    + "<span style=\"color: #FACC15; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;\">Owner Portal</span>"
                    + "</div>"
                    + "<h1 style=\"color: #FFFFFF; margin: 0; font-size: 32px; font-weight: 900; letter-spacing: 3px;\">SPORTA</h1>"
                    + "<p style=\"color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 13px; font-weight: 500;\">Hệ thống Quản lý Sân Thể Thao Thông Minh</p>"
                    + "</div>"
                    // Body Content
                    + "<div style=\"padding: 32px 28px;\">"
                    + "<div style=\"text-align: center; margin-bottom: 24px;\">"
                    + "<div style=\"display: inline-block; background-color: #ecfdf5; color: #047857; padding: 8px 18px; border-radius: 12px; font-size: 13.5px; font-weight: 700; border: 1px solid #a7f3d0;\">"
                    + "🎉 Hồ sơ đăng ký đã được xét duyệt thành công!"
                    + "</div>"
                    + "</div>"
                    + "<h2 style=\"color: #064E3B; margin: 0 0 10px; font-size: 20px; font-weight: 800; text-align: center;\">Thông Tin Tài Khoản Đăng Nhập</h2>"
                    + "<p style=\"color: #475569; font-size: 14px; line-height: 1.6; text-align: center; margin: 0 0 24px;\">"
                    + "Chúc mừng bạn đã chính thức trở thành Đối tác Chủ sân của <strong>SPORTA</strong>. Dưới đây là thông tin đăng nhập dành riêng cho bạn:"
                    + "</p>"
                    // Credential Card
                    + "<div style=\"background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%); border: 2px dashed #059669; border-radius: 14px; padding: 24px; margin-bottom: 24px;\">"
                    + "<div style=\"margin-bottom: 18px;\">"
                    + "<span style=\"font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;\">✉️ Email Đăng Nhập</span>"
                    + "<div style=\"font-size: 16px; font-weight: 700; color: #064E3B; background: #ffffff; padding: 10px 14px; border-radius: 8px; border: 1px solid #cbd5e1; word-break: break-all;\">"
                    + toEmail
                    + "</div>"
                    + "</div>"
                    + "<div>"
                    + "<span style=\"font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;\">🔑 Mật Khẩu Tạm Thời</span>"
                    + "<div style=\"font-size: 22px; font-weight: 800; color: #047857; background: #ffffff; padding: 12px 14px; border-radius: 8px; border: 1px solid #cbd5e1; font-family: 'Courier New', Courier, monospace; letter-spacing: 3px; text-align: center;\">"
                    + temporaryPassword
                    + "</div>"
                    + "</div>"
                    + "</div>"
                    // Security Warning Card
                    + "<div style=\"background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 28px;\">"
                    + "<table style=\"width: 100%; border-collapse: collapse;\">"
                    + "<tr>"
                    + "<td style=\"width: 24px; vertical-align: top; font-size: 18px;\">⚠️</td>"
                    + "<td style=\"padding-left: 8px;\">"
                    + "<strong style=\"color: #b45309; font-size: 13px; display: block; margin-bottom: 2px;\">Lưu ý quan trọng:</strong>"
                    + "<span style=\"color: #92400e; font-size: 12px; line-height: 1.5; display: block;\">"
                    + "Bạn sẽ được yêu cầu <strong>đổi mật khẩu mới</strong> trong lần đăng nhập đầu tiên để bảo mật tài khoản. Vui lòng không chia sẻ thông tin này cho bất kỳ ai."
                    + "</span>"
                    + "</td>"
                    + "</tr>"
                    + "</table>"
                    + "</div>"
                    // Login CTA Button
                    + "<div style=\"text-align: center; margin-bottom: 12px;\">"
                    + "<a href=\"http://localhost:5173/login\" target=\"_blank\" style=\"display: inline-block; background: linear-gradient(135deg, #064E3B 0%, #047857 100%); color: #FFFFFF; font-size: 15px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 30px; box-shadow: 0 4px 14px rgba(6,78,59,0.35);\">"
                    + "Đăng Nhập Vào Owner Portal →"
                    + "</a>"
                    + "</div>"
                    + "</div>"
                    // Footer
                    + "<div style=\"background-color: #f8fafc; padding: 20px 28px; border-top: 1px solid #e2e8f0; text-align: center;\">"
                    + "<p style=\"margin: 0 0 6px; color: #64748b; font-size: 12px; font-weight: 600;\">SPORTA - Nền tảng kết nối chủ sân & người chơi hàng đầu</p>"
                    + "<p style=\"margin: 0; color: #94a3b8; font-size: 11px;\">© 2026 Sporta, Inc. Tất cả các quyền được bảo lưu.</p>"
                    + "</div>"
                    + "</div>"
                    + "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send account approved email: " + e.getMessage(), e);
        }
    }
}
