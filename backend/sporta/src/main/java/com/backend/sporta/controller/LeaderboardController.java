package com.backend.sporta.controller;

import com.backend.sporta.dto.LeaderboardResponse;
import com.backend.sporta.service.LeaderboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/leaderboard")
@CrossOrigin(origins = "*")
public class LeaderboardController {

    @Autowired
    private LeaderboardService leaderboardService;

    @GetMapping
    public ResponseEntity<List<LeaderboardResponse>> getLeaderboard(
            @RequestParam(required = false) Long sportId,
            @RequestParam(required = false) String area,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer size,
            Authentication authentication) {
        String email = (authentication != null && authentication.isAuthenticated()) ? authentication.getName() : null;
        return ResponseEntity.ok(leaderboardService.getLeaderboard(sportId, area, page, size, email));
    }

    @GetMapping("/rewards")
    public ResponseEntity<Map<String, Object>> getSeasonRewards() {
        return ResponseEntity.ok(Map.of(
            "seasonName", "Mùa 1 - 2026: Tranh Bá Thể Thao",
            "endDate", "2026-09-30T23:59:59",
            "daysRemaining", 18,
            "totalPrizePool", "38.500.000 VNĐ",
            "overallChampion", Map.of(
                "title", "ĐẠI QUÁN QUÂN TOÀN HỆ THỐNG",
                "badge", "Cúp Vàng Vô Cực & Huy Hiệu Huyền Thoại",
                "cashReward", "10.000.000 VNĐ",
                "courtTickets", "30 Vé đặt sân miễn phí 100% (tất cả các môn)",
                "memberVoucher", "Voucher 50% toàn hệ sinh thái Sporta cho toàn bộ thành viên",
                "spotlight", "Vinh danh Banner Trang Chủ & Bảng Vàng Quốc Gia suốt mùa kế tiếp"
            ),
            "tiers", List.of(
                Map.of(
                    "tier", "CHAMPION",
                    "title", "Vô Địch Bộ Môn (Top 1)",
                    "badge", "Cúp Vàng Danh Giá & Huy Hiệu Kim Cương",
                    "cashReward", "5.000.000 VNĐ",
                    "courtTickets", "20 Vé đặt sân bộ môn miễn phí 100%",
                    "memberVoucher", "Voucher 40% dịch vụ cho thành viên",
                    "spotlight", "Ưu tiên hiển thị Top 1 Spotlight bộ môn"
                ),
                Map.of(
                    "tier", "RUNNER_UP",
                    "title", "Á Quân Bộ Môn (Top 2)",
                    "badge", "Kỷ Niệm Chương Bạc & Huy Hiệu Bạch Kim",
                    "cashReward", "3.000.000 VNĐ",
                    "courtTickets", "10 Vé đặt sân miễn phí 100%",
                    "memberVoucher", "Voucher 30% cho thành viên",
                    "spotlight", "Vinh danh bảng vàng bộ môn"
                ),
                Map.of(
                    "tier", "THIRD_PLACE",
                    "title", "Hạng Ba Bộ Môn (Top 3)",
                    "badge", "Kỷ Niệm Chương Đồng & Huy Hiệu Vàng",
                    "cashReward", "1.500.000 VNĐ",
                    "courtTickets", "5 Vé đặt sân miễn phí 100%",
                    "memberVoucher", "Voucher 20% cho thành viên",
                    "spotlight", "Vinh danh bảng vàng bộ môn"
                ),
                Map.of(
                    "tier", "ELITE",
                    "title", "Top 4 - 10 Tinh Anh",
                    "badge", "Huy Hiệu Tinh Anh Bạc",
                    "cashReward", "800.000 VNĐ Voucher CLB",
                    "courtTickets", "3 Vé đặt sân giảm 50%",
                    "memberVoucher", "Voucher 15% cho thành viên",
                    "spotlight", "Vinh danh Top 10 mùa giải"
                ),
                Map.of(
                    "tier", "CHALLENGER",
                    "title", "Top 11+ Phong Trào",
                    "badge", "Huy Hiệu Phong Trào Đồng",
                    "cashReward", "Quà tặng lưu niệm Sporta",
                    "courtTickets", "Tích lũy điểm thưởng CRP mỗi trận đấu",
                    "memberVoucher", "Voucher 10% chào mừng",
                    "spotlight", "Cơ hội thăng hạng tuần tiếp theo"
                )
            ),
            "sportSpecificDetails", Map.of(
                "football", Map.of(
                    "sportName", "Bóng Đá",
                    "icon", "sports-soccer",
                    "firstPrize", "5.000.000 VNĐ + Cúp Vàng King of Football + 15 Vé sân 7 người 0đ + 1 Bộ áo đấu CLB in logo riêng",
                    "secondPrize", "3.000.000 VNĐ + Kỷ niệm chương Bạc + 10 Vé sân 7 người 0đ + 2 Quả bóng thi đấu Động Lực FIFA Quality Pro",
                    "thirdPrize", "1.500.000 VNĐ + Kỷ niệm chương Đồng + 5 Vé sân 0đ + Bình xịt lạnh chấn thương thể thao",
                    "specialPerk", "Được ưu tiên ghép kèo sân lớn và giải đấu tứ hùng do Sporta tài trợ"
                ),
                "badminton", Map.of(
                    "sportName", "Cầu Lông",
                    "icon", "sports-tennis",
                    "firstPrize", "5.000.000 VNĐ + Cúp Vàng Smash Master + 20 Vé sân thảm tiêu chuẩn BWF 0đ + 10 Ống cầu Yonex cao cấp",
                    "secondPrize", "3.000.000 VNĐ + Kỷ niệm chương Bạc + 10 Vé sân 0đ + 5 Ống cầu thi đấu",
                    "thirdPrize", "1.500.000 VNĐ + Kỷ niệm chương Đồng + 5 Vé sân 0đ + Voucher căng cước vợt 50%",
                    "specialPerk", "Quyền lợi đặt trước khung giờ vàng tại hệ thống cụm sân cầu lông đối tác"
                ),
                "pickleball", Map.of(
                    "sportName", "Pickleball",
                    "icon", "sports-tennis",
                    "firstPrize", "5.000.000 VNĐ + Cúp Vàng Dinking Legend + 20 Vé sân Pickleball 0đ + 1 Thùng bóng thi đấu Franklin X-40",
                    "secondPrize", "3.000.000 VNĐ + Kỷ niệm chương Bạc + 10 Vé sân 0đ + Voucher mua Paddle Joola 30%",
                    "thirdPrize", "1.500.000 VNĐ + Kỷ niệm chương Đồng + 5 Vé sân 0đ + Túi đựng vợt thể thao cao cấp",
                    "specialPerk", "Vé mời tham dự giải đấu Pickleball Open Tournament Mùa 1"
                ),
                "basketball", Map.of(
                    "sportName", "Bóng Rổ",
                    "icon", "sports-basketball",
                    "firstPrize", "5.000.000 VNĐ + Cúp Vàng Dunk Master + 15 Vé sân bóng rổ tiêu chuẩn 0đ + 3 Quả bóng thi đấu Molten GG7X",
                    "secondPrize", "3.000.000 VNĐ + Kỷ niệm chương Bạc + 10 Vé sân 0đ + 1 Quả bóng Molten",
                    "thirdPrize", "1.500.000 VNĐ + Kỷ niệm chương Đồng + 5 Vé sân 0đ + Băng quấn cổ chân y tế",
                    "specialPerk", "Hỗ trợ trọng tài và bảng điểm điện tử cho các trận giao lưu nội bộ"
                )
            ),
            "eligibilityRules", List.of(
                "CLB phải có tối thiểu 5 thành viên chính thức đã hoàn thành xác minh hồ sơ.",
                "Hoàn thành tối thiểu 8 trận đấu ghép kèo chính thức qua hệ thống Sporta trong suốt mùa giải.",
                "Tỷ lệ thành viên tham gia hoạt động thực tế đạt từ 60% trở lên.",
                "Không có lịch sử bị báo cáo gian lận tỷ số hoặc bỏ trận không lý do.",
                "Quỹ tài trợ tiền mặt sẽ được chuyển trực tiếp vào Ví CLB của Trưởng câu lạc bộ trong vòng 3 ngày sau khi chốt bảng xếp hạng."
            )
        ));
    }
}
