package com.backend.sporta.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.File;
import org.springframework.scheduling.annotation.Async;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    private File getLogoFile() {
        String[] candidatePaths = new String[]{
            "d:/Sporta/sporta/mobile-user/assets/logo/logo-main_699x699.png",
            "mobile-user/assets/logo/logo-main_699x699.png",
            "../mobile-user/assets/logo/logo-main_699x699.png",
            "d:/Sporta/sporta/mobile-user/assets/logo/logo-horizontal_1600x400.png"
        };
        for (String path : candidatePaths) {
            File file = new File(path);
            if (file.exists()) {
                return file;
            }
        }
        return null;
    }

    @Async
    public void sendOtpEmail(String toEmail, String otpCode) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("shethongthethao@gmail.com", "SPORTA System");
            helper.setTo(toEmail);
            helper.setSubject("SPORTA - Mã OTP xác thực của bạn");

            File logoFile = getLogoFile();
            boolean hasLogo = (logoFile != null);

            String logoHtml;
            if (hasLogo) {
                logoHtml = "<div style=\"margin-bottom: 8px;\">"
                         + "<img src=\"cid:sportaLogo\" alt=\"SPORTA\" style=\"max-height: 55px; width: auto; display: inline-block;\" />"
                         + "</div>";
            } else {
                logoHtml = "<div style=\"margin-bottom: 8px;\">"
                         + "<svg width=\"44\" height=\"44\" viewBox=\"0 0 48 48\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" style=\"display: inline-block; vertical-align: middle;\">"
                         + "<circle cx=\"24\" cy=\"24\" r=\"22\" fill=\"#064E3B\" fill-opacity=\"0.1\" stroke=\"#064E3B\" stroke-width=\"2\"/>"
                         + "<path d=\"M24 10L35 16V25C35 32 29 37 24 40C19 37 13 32 13 25V16L24 10Z\" fill=\"#064E3B\" stroke=\"#FED01B\" stroke-width=\"2.5\" stroke-linejoin=\"round\"/>"
                         + "<path d=\"M20 23.5L23 26.5L28.5 19.5\" stroke=\"#FED01B\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>"
                         + "</svg>"
                         + "</div>";
            }

            String htmlContent = "<div style=\"font-family: 'Hanken Grotesk', 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; max-width: 580px; margin: 0 auto; background-color: #f8fafc; padding: 24px 16px; color: #0f172a;\">"
                    + "<div style=\"background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;\">"
                    // Header Banner (Light White Header with Subtle Bottom Border)
                    + "<div style=\"background-color: #ffffff; border-bottom: 3px solid #064E3B; padding: 28px 24px; text-align: center;\">"
                    + logoHtml
                    + "<h1 style=\"color: #064E3B; margin: 4px 0 0; font-size: 24px; font-weight: 800; letter-spacing: 1px;\">SPORTA</h1>"
                    + "<p style=\"color: #64748b; margin: 4px 0 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;\">MÃ XÁC THỰC OTP</p>"
                    + "</div>"
                    // Body Content
                    + "<div style=\"padding: 28px 24px; text-align: center;\">"
                    + "<h2 style=\"color: #064E3B; margin: 0 0 10px; font-size: 18px; font-weight: 700;\">Xác Thực Mã OTP Của Bạn</h2>"
                    + "<p style=\"color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 20px;\">"
                    + "Cảm ơn bạn đã sử dụng dịch vụ của <strong>SPORTA</strong>. Vui lòng sử dụng mã OTP gồm 6 chữ số dưới đây để hoàn tất xác thực:"
                    + "</p>"
                    // Clean Minimalist OTP Box
                    + "<div style=\"background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 18px 24px; margin: 0 auto 20px; max-width: 280px;\">"
                    + "<span style=\"font-size: 32px; font-weight: 700; color: #064E3B; letter-spacing: 8px; font-family: 'Hanken Grotesk', 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; display: block;\">"
                    + otpCode
                    + "</span>"
                    + "</div>"
                    // Expiration Note
                    + "<p style=\"color: #64748b; font-size: 13px; margin: 0 0 16px; line-height: 1.5;\">"
                    + "Mã OTP này có hiệu lực trong <strong style=\"color: #064E3B;\">5 phút</strong>. Vui lòng tuyệt đối không chia sẻ mã này cho người khác."
                    + "</p>"
                    + "<hr style=\"border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;\" />"
                    + "<p style=\"color: #94a3b8; font-size: 11.5px; margin: 0;\">"
                    + "Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email hoặc liên hệ với bộ phận hỗ trợ SPORTA."
                    + "</p>"
                    + "</div>"
                    // Footer
                    + "<div style=\"background-color: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; text-align: center;\">"
                    + "<p style=\"margin: 0; color: #94a3b8; font-size: 11px;\">© 2026 Sporta, Inc. Tất cả các quyền được bảo lưu.</p>"
                    + "</div>"
                    + "</div>"
                    + "</div>";

            helper.setText(htmlContent, true);
            if (hasLogo) {
                helper.addInline("sportaLogo", logoFile);
            }
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send OTP email: " + e.getMessage(), e);
        }
    }

    /**
     * Send an email notifying the owner that their registration has been approved.
     * Includes login credentials (email + temporary password).
     */
    @Async
    public void sendAccountApprovedEmail(String toEmail, String temporaryPassword) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("shethongthethao@gmail.com", "SPORTA Owner Portal");
            helper.setTo(toEmail);
            helper.setSubject("SPORTA - Tài khoản Chủ sân của bạn đã được kích hoạt");

            File logoFile = getLogoFile();
            boolean hasLogo = (logoFile != null);

            String logoHtml;
            if (hasLogo) {
                logoHtml = "<div style=\"margin-bottom: 8px;\">"
                         + "<img src=\"cid:sportaLogo\" alt=\"SPORTA\" style=\"max-height: 55px; width: auto; display: inline-block;\" />"
                         + "</div>";
            } else {
                logoHtml = "<div style=\"margin-bottom: 8px;\">"
                         + "<svg width=\"44\" height=\"44\" viewBox=\"0 0 48 48\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" style=\"display: inline-block; vertical-align: middle;\">"
                         + "<circle cx=\"24\" cy=\"24\" r=\"22\" fill=\"#064E3B\" fill-opacity=\"0.1\" stroke=\"#064E3B\" stroke-width=\"2\"/>"
                         + "<path d=\"M24 10L35 16V25C35 32 29 37 24 40C19 37 13 32 13 25V16L24 10Z\" fill=\"#064E3B\" stroke=\"#FED01B\" stroke-width=\"2.5\" stroke-linejoin=\"round\"/>"
                         + "<path d=\"M20 23.5L23 26.5L28.5 19.5\" stroke=\"#FED01B\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>"
                         + "</svg>"
                         + "</div>";
            }

            String htmlContent = "<div style=\"font-family: 'Hanken Grotesk', 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; max-width: 580px; margin: 0 auto; background-color: #f8fafc; padding: 24px 16px; color: #0f172a;\">"
                    + "<div style=\"background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;\">"
                    // Header Banner (Light White Header with Subtle Green Border)
                    + "<div style=\"background-color: #ffffff; border-bottom: 3px solid #064E3B; padding: 28px 24px; text-align: center;\">"
                    + logoHtml
                    + "<h1 style=\"color: #064E3B; margin: 4px 0 0; font-size: 26px; font-weight: 800; letter-spacing: 1px;\">SPORTA</h1>"
                    + "<p style=\"color: #64748b; margin: 4px 0 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;\">OWNER PORTAL</p>"
                    + "</div>"
                    // Body Content
                    + "<div style=\"padding: 28px 24px;\">"
                    + "<h2 style=\"color: #064E3B; margin: 0 0 8px; font-size: 20px; font-weight: 700; text-align: center;\">Tài Khoản Chủ Sân Đã Được Kích Hoạt</h2>"
                    + "<p style=\"color: #475569; font-size: 14px; line-height: 1.6; text-align: center; margin: 0 0 24px;\">"
                    + "Chúc mừng bạn đã hoàn tất đăng ký chủ sân trên <strong>SPORTA</strong>. Dưới đây là thông tin tài khoản để bạn đăng nhập:"
                    + "</p>"
                    // Extremely Simple & Clean Credential Container
                    + "<div style=\"background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 24px; margin-bottom: 20px;\">"
                    // Email Row
                    + "<div style=\"margin-bottom: 16px;\">"
                    + "<div style=\"font-size: 12.5px; font-weight: 600; color: #64748b; margin-bottom: 4px;\">Email đăng nhập:</div>"
                    + "<div style=\"font-size: 15px; font-weight: 600; color: #0f172a; word-break: break-all;\">"
                    + toEmail
                    + "</div>"
                    + "</div>"
                    // Password Row
                    + "<div>"
                    + "<div style=\"font-size: 12.5px; font-weight: 600; color: #64748b; margin-bottom: 4px;\">Mật khẩu tạm thời:</div>"
                    + "<div style=\"font-size: 18px; font-weight: 700; color: #064E3B; letter-spacing: 2px;\">"
                    + temporaryPassword
                    + "</div>"
                    + "</div>"
                    + "</div>"
                    // Simple Security Warning Box
                    + "<div style=\"background-color: #fffbeb; border: 1px solid #fef08a; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px; color: #854d0e; font-size: 13px; line-height: 1.5;\">"
                    + "Lưu ý: Bạn nên thay đổi mật khẩu ngay trong lần đăng nhập đầu tiên để bảo mật tài khoản."
                    + "</div>"
                    // Primary Action CTA Button (Simple, Clean Green Button)
                    + "<div style=\"text-align: center; margin-bottom: 16px;\">"
                    + "<a href=\"http://localhost:5173/login\" target=\"_blank\" style=\"display: inline-block; background-color: #064E3B; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 12px 32px; border-radius: 8px;\">"
                    + "Đăng Nhập Vào Owner Portal"
                    + "</a>"
                    + "</div>"
                    + "</div>"
                    // Footer
                    + "<div style=\"background-color: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; text-align: center;\">"
                    + "<p style=\"margin: 0; color: #94a3b8; font-size: 11px;\">© 2026 Sporta, Inc. Tất cả các quyền được bảo lưu.</p>"
                    + "</div>"
                    + "</div>"
                    + "</div>";

            helper.setText(htmlContent, true);
            if (hasLogo) {
                helper.addInline("sportaLogo", logoFile);
            }
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send account approved email: " + e.getMessage(), e);
        }
    }

    /**
     * Send booking success confirmation email with full details to the user.
     */
    @Async
    public void sendBookingSuccessEmail(String toEmail, com.backend.sporta.entity.Booking booking) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("shethongthethao@gmail.com", "SPORTA Booking");
            helper.setTo(toEmail);
            helper.setSubject("SPORTA - Xác nhận đặt sân thành công (Mã: " + booking.getBookingCode() + ")");

            File logoFile = getLogoFile();
            boolean hasLogo = (logoFile != null);

            String logoHtml;
            if (hasLogo) {
                logoHtml = "<div style=\"margin-bottom: 8px;\">"
                         + "<img src=\"cid:sportaLogo\" alt=\"SPORTA\" style=\"max-height: 55px; width: auto; display: inline-block;\" />"
                         + "</div>";
            } else {
                logoHtml = "<div style=\"margin-bottom: 8px;\">"
                         + "<svg width=\"44\" height=\"44\" viewBox=\"0 0 48 48\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" style=\"display: inline-block; vertical-align: middle;\">"
                         + "<circle cx=\"24\" cy=\"24\" r=\"22\" fill=\"#064E3B\" fill-opacity=\"0.1\" stroke=\"#064E3B\" stroke-width=\"2\"/>"
                         + "<path d=\"M24 10L35 16V25C35 32 29 37 24 40C19 37 13 32 13 25V16L24 10Z\" fill=\"#064E3B\" stroke=\"#FED01B\" stroke-width=\"2.5\" stroke-linejoin=\"round\"/>"
                         + "<path d=\"M20 23.5L23 26.5L28.5 19.5\" stroke=\"#FED01B\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>"
                         + "</svg>"
                         + "</div>";
            }

            // Build slots HTML
            StringBuilder slotsHtml = new StringBuilder();
            if (booking.getDetails() != null && !booking.getDetails().isEmpty()) {
                slotsHtml.append("<table style=\"width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px;\">");
                slotsHtml.append("<tr style=\"background-color: #e2e8f0; color: #334155; text-align: left;\">");
                slotsHtml.append("<th style=\"padding: 8px 12px;\">Sân</th>");
                slotsHtml.append("<th style=\"padding: 8px 12px;\">Ngày</th>");
                slotsHtml.append("<th style=\"padding: 8px 12px;\">Khung giờ</th>");
                slotsHtml.append("<th style=\"padding: 8px 12px; text-align: right;\">Giá</th>");
                slotsHtml.append("</tr>");

                for (com.backend.sporta.entity.BookingDetail d : booking.getDetails()) {
                    String courtName = (d.getCourt() != null) ? d.getCourt().getName() : "Sân";
                    String dateStr = (d.getBookingDate() != null) ? d.getBookingDate().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "";
                    String timeStr = (d.getStartTime() != null && d.getEndTime() != null) ? d.getStartTime() + " - " + d.getEndTime() : "";
                    String priceStr = String.format("%,.0f VNĐ", d.getPrice());

                    slotsHtml.append("<tr style=\"border-bottom: 1px solid #f1f5f9; color: #0f172a;\">");
                    slotsHtml.append("<td style=\"padding: 8px 12px; font-weight: 600;\">").append(courtName).append("</td>");
                    slotsHtml.append("<td style=\"padding: 8px 12px;\">").append(dateStr).append("</td>");
                    slotsHtml.append("<td style=\"padding: 8px 12px;\">").append(timeStr).append("</td>");
                    slotsHtml.append("<td style=\"padding: 8px 12px; text-align: right; font-weight: 600;\">").append(priceStr).append("</td>");
                    slotsHtml.append("</tr>");
                }
                slotsHtml.append("</table>");
            }

            String venueName = (booking.getVenue() != null) ? booking.getVenue().getName() : "N/A";
            String venueLocation = (booking.getVenue() != null) ? booking.getVenue().getLocation() : "N/A";
            
            String customerName = (booking.getCustomerName() != null && !booking.getCustomerName().isEmpty()) 
                    ? booking.getCustomerName() 
                    : ((booking.getUser() != null && booking.getUser().getFullName() != null) ? booking.getUser().getFullName() : "N/A");
            
            String customerPhone = (booking.getCustomerPhone() != null && !booking.getCustomerPhone().isEmpty()) 
                    ? booking.getCustomerPhone() 
                    : ((booking.getUser() != null && booking.getUser().getPhoneNumber() != null) ? booking.getUser().getPhoneNumber() : "");
            
            if ("null".equalsIgnoreCase(customerPhone)) {
                customerPhone = "";
            }

            String customerDisplay = customerName;
            if (!customerPhone.isEmpty()) {
                customerDisplay += " (" + customerPhone + ")";
            }

            String paymentMethod = (booking.getPaymentMethod() != null) ? booking.getPaymentMethod().toUpperCase() : "N/A";

            String totalPriceStr = String.format("%,.0f VNĐ", booking.getTotalPrice());
            String discountStr = (booking.getDiscountAmount() != null && booking.getDiscountAmount() > 0) 
                    ? String.format("%,.0f VNĐ", booking.getDiscountAmount()) : null;
            String finalPriceStr = String.format("%,.0f VNĐ", booking.getFinalPrice());

            String htmlContent = "<div style=\"font-family: 'Hanken Grotesk', 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; max-width: 580px; margin: 0 auto; background-color: #f8fafc; padding: 24px 16px; color: #0f172a;\">"
                    + "<div style=\"background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;\">"
                    // Header Banner
                    + "<div style=\"background-color: #ffffff; border-bottom: 3px solid #064E3B; padding: 28px 24px; text-align: center;\">"
                    + logoHtml
                    + "<h1 style=\"color: #064E3B; margin: 4px 0 0; font-size: 26px; font-weight: 800; letter-spacing: 1px;\">SPORTA</h1>"
                    + "<p style=\"color: #64748b; margin: 4px 0 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;\">XÁC NHẬN ĐẶT SÂN THÀNH CÔNG</p>"
                    + "</div>"
                    // Body Content
                    + "<div style=\"padding: 28px 24px;\">"
                    + "<h2 style=\"color: #064E3B; margin: 0 0 8px; font-size: 20px; font-weight: 700; text-align: center;\">Xác Nhận Đặt Sân Thành Công</h2>"
                    + "<p style=\"color: #475569; font-size: 14px; line-height: 1.6; text-align: center; margin: 0 0 24px;\">"
                    + "Cảm ơn bạn đã đặt sân trên <strong>SPORTA</strong>. Đơn đặt sân của bạn đã được xác nhận thành công!"
                    + "</p>"
                    // Credential Container (Booking Details)
                    + "<div style=\"background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 24px; margin-bottom: 20px;\">"
                    + "<div style=\"margin-bottom: 12px;\">"
                    + "<div style=\"font-size: 12.5px; font-weight: 600; color: #64748b;\">Mã đặt sân:</div>"
                    + "<div style=\"font-size: 18px; font-weight: 800; color: #064E3B; letter-spacing: 1px;\">" + booking.getBookingCode() + "</div>"
                    + "</div>"
                    + "<div style=\"margin-bottom: 12px;\">"
                    + "<div style=\"font-size: 12.5px; font-weight: 600; color: #64748b;\">Cơ sở thể thao:</div>"
                    + "<div style=\"font-size: 15px; font-weight: 600; color: #0f172a;\">" + venueName + "</div>"
                    + "<div style=\"font-size: 13px; color: #475569;\">" + venueLocation + "</div>"
                    + "</div>"
                    + "<div style=\"margin-bottom: 12px;\">"
                    + "<div style=\"font-size: 12.5px; font-weight: 600; color: #64748b;\">Người đặt:</div>"
                    + "<div style=\"font-size: 14px; color: #0f172a;\">" + customerDisplay + "</div>"
                    + "</div>"
                    + "<div style=\"margin-bottom: 16px;\">"
                    + "<div style=\"font-size: 12.5px; font-weight: 600; color: #64748b;\">Phương thức thanh toán:</div>"
                    + "<div style=\"font-size: 14px; color: #0f172a;\">" + paymentMethod + "</div>"
                    + "</div>"
                    + "<div style=\"font-size: 12.5px; font-weight: 600; color: #64748b; margin-bottom: 6px;\">Chi tiết khung giờ:</div>"
                    + slotsHtml.toString()
                    + "<hr style=\"border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;\" />"
                    + "<div style=\"display: table; width: 100%; margin-bottom: 6px; font-size: 14px;\">"
                    + "<div style=\"display: table-cell; color: #64748b;\">Tổng tiền:</div>"
                    + "<div style=\"display: table-cell; text-align: right; color: #0f172a; font-weight: 600;\">" + totalPriceStr + "</div>"
                    + "</div>"
                    + (discountStr != null ? 
                      "<div style=\"display: table; width: 100%; margin-bottom: 6px; font-size: 14px;\">"
                    + "<div style=\"display: table-cell; color: #64748b;\">Giảm giá:</div>"
                    + "<div style=\"display: table-cell; text-align: right; color: #dc2626; font-weight: 600;\">-" + discountStr + "</div>"
                    + "</div>" : "")
                    + "<div style=\"display: table; width: 100%; margin-top: 8px; font-size: 16px; font-weight: 700;\">"
                    + "<div style=\"display: table-cell; color: #064E3B;\">Thành tiền:</div>"
                    + "<div style=\"display: table-cell; text-align: right; color: #064E3B;\">" + finalPriceStr + "</div>"
                    + "</div>"
                    + "</div>"
                    // Security Note / Notice
                    + "<div style=\"background-color: #fffbeb; border: 1px solid #fef08a; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px; color: #854d0e; font-size: 13px; line-height: 1.5;\">"
                    + "Vui lòng xuất trình mã đặt sân <strong>" + booking.getBookingCode() + "</strong> tại quầy tiếp đón của cơ sở khi đến thi đấu."
                    + "</div>"
                    + "</div>"
                    // Footer
                    + "<div style=\"background-color: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; text-align: center;\">"
                    + "<p style=\"margin: 0; color: #94a3b8; font-size: 11px;\">© 2026 Sporta, Inc. Tất cả các quyền được bảo lưu.</p>"
                    + "</div>"
                    + "</div>"
                    + "</div>";

            helper.setText(htmlContent, true);
            if (hasLogo) {
                helper.addInline("sportaLogo", logoFile);
            }
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send booking success email: " + e.getMessage());
        }
    }
}
