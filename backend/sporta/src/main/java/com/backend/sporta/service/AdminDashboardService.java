package com.backend.sporta.service;

import com.backend.sporta.dto.AdminDashboardResponse;
import com.backend.sporta.dto.AdminDashboardResponse.*;
import com.backend.sporta.entity.Booking;
import com.backend.sporta.entity.User;
import com.backend.sporta.entity.Venue;
import com.backend.sporta.enums.ApprovalStatus;
import com.backend.sporta.enums.BookingStatus;
import com.backend.sporta.enums.RegistrationStatus;
import com.backend.sporta.enums.VenueStatus;
import com.backend.sporta.repository.BookingRepository;
import com.backend.sporta.repository.OwnerRegistrationRepository;
import com.backend.sporta.repository.UserRepository;
import com.backend.sporta.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.DecimalFormat;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminDashboardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private OwnerRegistrationRepository ownerRegistrationRepository;

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboardOverview(String timeFilter) {
        LocalDate today = LocalDate.now();
        LocalDate firstDayThisMonth = today.withDayOfMonth(1);
        LocalDate firstDayLastMonth = today.minusMonths(1).withDayOfMonth(1);
        LocalDate lastDayLastMonth = firstDayThisMonth.minusDays(1);
        LocalDate firstDayThisYear = today.withDayOfYear(1);

        // 1. Fetch Bookings and filter valid ones
        List<Booking> allBookings = bookingRepository.findAll();
        List<Booking> validBookings = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED || b.getStatus() == BookingStatus.CONFIRMED)
                .collect(Collectors.toList());

        // 2. Filter bookings according to timeFilter for KPI calculation
        List<Booking> periodBookings;
        String filterPeriodText;
        if ("last_month".equalsIgnoreCase(timeFilter)) {
            periodBookings = filterBookingsByDateRange(validBookings, firstDayLastMonth, lastDayLastMonth);
            filterPeriodText = "Trong tháng trước";
        } else if ("year".equalsIgnoreCase(timeFilter)) {
            periodBookings = filterBookingsByDateRange(validBookings, firstDayThisYear, today);
            filterPeriodText = "Trong năm nay";
        } else { // "this_month" or default
            periodBookings = filterBookingsByDateRange(validBookings, firstDayThisMonth, today);
            filterPeriodText = "Trong tháng này";
        }

        // 3. Calculate Core Metrics for the selected timeFilter
        long userCount = userRepository.count();
        long periodBookingCount = periodBookings.size();
        List<Venue> pendingVenues = venueRepository.findByStatusAndApprovalStatus(VenueStatus.ACTIVE, ApprovalStatus.PENDING);
        long pendingRegsCount = ownerRegistrationRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(r -> r.getStatus() == RegistrationStatus.PENDING)
                .count();

        long totalPendingApprovals = pendingVenues.size() + pendingRegsCount;

        double totalGmv = periodBookings.stream()
                .mapToDouble(b -> b.getFinalPrice() != null ? b.getFinalPrice() : 0.0)
                .sum();

        double commission = totalGmv * 0.10;

        DecimalFormat formatter = new DecimalFormat("#,###");
        String formattedTotalRevenue = formatter.format(totalGmv) + " đ";
        String formattedCommission = formatter.format(commission) + " đ";

        List<AdminKpiDto> metrics = new ArrayList<>();
        metrics.add(AdminKpiDto.builder()
                .label("Tổng Doanh Thu")
                .value(formattedTotalRevenue)
                .change(filterPeriodText)
                .isPositive(true)
                .build());

        metrics.add(AdminKpiDto.builder()
                .label("Doanh thu Hoa hồng")
                .value(formattedCommission)
                .change("10% GMV (" + filterPeriodText.toLowerCase() + ")")
                .isPositive(true)
                .tooltip("Tính bằng 10% chiết khấu trung bình nhân với tổng số tiền giao dịch thành công trong khoảng thời gian đã chọn.")
                .build());

        metrics.add(AdminKpiDto.builder()
                .label("Tổng Người Dùng")
                .value(formatter.format(userCount))
                .change("Tổng số tài khoản hệ thống")
                .isPositive(true)
                .build());

        metrics.add(AdminKpiDto.builder()
                .label("Lượt Đặt Sân")
                .value(formatter.format(periodBookingCount))
                .change(filterPeriodText)
                .isPositive(true)
                .build());

        metrics.add(AdminKpiDto.builder()
                .label("Sân Chờ Duyệt")
                .value(String.valueOf(totalPendingApprovals))
                .change(totalPendingApprovals > 0 ? "Cần xử lý ngay" : "Đã xử lý xong")
                .isPositive(totalPendingApprovals == 0)
                .build());

        // 4. REAL Partner Leaderboard (Calculated per Venue for this_month, last_month, year)
        List<Venue> allVenues = venueRepository.findAll();

        List<PartnerDataDto> thisMonthList = buildLeaderboardForDateRange(allVenues, validBookings, firstDayThisMonth, today);
        List<PartnerDataDto> lastMonthList = buildLeaderboardForDateRange(allVenues, validBookings, firstDayLastMonth, lastDayLastMonth);
        List<PartnerDataDto> yearList = buildLeaderboardForDateRange(allVenues, validBookings, firstDayThisYear, today);

        Map<String, List<PartnerDataDto>> leaderboardData = new HashMap<>();
        leaderboardData.put("this_month", thisMonthList);
        leaderboardData.put("last_month", lastMonthList);
        leaderboardData.put("year", yearList);

        // 3. REAL Revenue Chart Data (Grouped by Day of Week: T2 -> CN)
        LocalDate startOfWeek = today.with(DayOfWeek.MONDAY);

        Map<DayOfWeek, Double> dailyRevenueMap = new EnumMap<>(DayOfWeek.class);
        for (DayOfWeek day : DayOfWeek.values()) {
            dailyRevenueMap.put(day, 0.0);
        }

        for (Booking b : validBookings) {
            LocalDateTime dt = b.getCreatedAt() != null ? b.getCreatedAt() : LocalDateTime.now();
            LocalDate bDate = dt.toLocalDate();
            if (!bDate.isBefore(startOfWeek) && !bDate.isAfter(today)) {
                DayOfWeek dow = bDate.getDayOfWeek();
                double amount = b.getFinalPrice() != null ? b.getFinalPrice() : 0.0;
                dailyRevenueMap.put(dow, dailyRevenueMap.get(dow) + amount);
            }
        }

        List<String> chartLabels = Arrays.asList("T2", "T3", "T4", "T5", "T6", "T7", "CN");
        List<Double> revenueValues = Arrays.asList(
                dailyRevenueMap.get(DayOfWeek.MONDAY),
                dailyRevenueMap.get(DayOfWeek.TUESDAY),
                dailyRevenueMap.get(DayOfWeek.WEDNESDAY),
                dailyRevenueMap.get(DayOfWeek.THURSDAY),
                dailyRevenueMap.get(DayOfWeek.FRIDAY),
                dailyRevenueMap.get(DayOfWeek.SATURDAY),
                dailyRevenueMap.get(DayOfWeek.SUNDAY)
        );

        AdminChartDataDto revenueData = AdminChartDataDto.builder()
                .labels(chartLabels)
                .values(revenueValues)
                .build();

        // 4. REAL User Registration Chart Data (Grouped by Day of Week: T2 -> CN)
        List<User> allUsers = userRepository.findAll();
        Map<DayOfWeek, Double> dailyUserMap = new EnumMap<>(DayOfWeek.class);
        for (DayOfWeek day : DayOfWeek.values()) {
            dailyUserMap.put(day, 0.0);
        }

        for (User u : allUsers) {
            LocalDateTime dt = u.getCreatedAt() != null ? u.getCreatedAt() : LocalDateTime.now();
            LocalDate uDate = dt.toLocalDate();
            if (!uDate.isBefore(startOfWeek) && !uDate.isAfter(today)) {
                DayOfWeek dow = uDate.getDayOfWeek();
                dailyUserMap.put(dow, dailyUserMap.get(dow) + 1.0);
            }
        }

        List<Double> userValues = Arrays.asList(
                dailyUserMap.get(DayOfWeek.MONDAY),
                dailyUserMap.get(DayOfWeek.TUESDAY),
                dailyUserMap.get(DayOfWeek.WEDNESDAY),
                dailyUserMap.get(DayOfWeek.THURSDAY),
                dailyUserMap.get(DayOfWeek.FRIDAY),
                dailyUserMap.get(DayOfWeek.SATURDAY),
                dailyUserMap.get(DayOfWeek.SUNDAY)
        );

        AdminChartDataDto userData = AdminChartDataDto.builder()
                .labels(chartLabels)
                .values(userValues)
                .build();

        // 5. REAL Activity Logs
        List<AdminActivityDto> activities = new ArrayList<>();
        if (pendingRegsCount > 0) {
            activities.add(AdminActivityDto.builder()
                    .id("act-reg")
                    .time("Mới nhất")
                    .message(String.format("Có %d đơn đăng ký đối tác chủ sân mới đang chờ duyệt.", pendingRegsCount))
                    .build());
        }
        if (pendingVenues.size() > 0) {
            activities.add(AdminActivityDto.builder()
                    .id("act-venue")
                    .time("Mới nhất")
                    .message(String.format("Có %d cụm sân mới đang chờ duyệt thông tin.", pendingVenues.size()))
                    .build());
        }
        if (!validBookings.isEmpty()) {
            Booking latestB = validBookings.get(validBookings.size() - 1);
            String vName = latestB.getVenue() != null ? latestB.getVenue().getName() : "sân thể thao";
            activities.add(AdminActivityDto.builder()
                    .id("act-booking")
                    .time("Gần nhất")
                    .message(String.format("Hệ thống ghi nhận đơn đặt sân mới thành công tại %s.", vName))
                    .build());
        }
        activities.add(AdminActivityDto.builder()
                .id("act-sys")
                .time("Hệ thống")
                .message("Hệ thống Sporta quản trị hoạt động ổn định và sẵn sàng xử lý giao dịch.")
                .build());

        return AdminDashboardResponse.builder()
                .metrics(metrics)
                .revenueData(revenueData)
                .userData(userData)
                .activities(activities)
                .leaderboardData(leaderboardData)
                .build();
    }

    private List<PartnerDataDto> buildLeaderboardForDateRange(List<Venue> allVenues, List<Booking> validBookings, LocalDate startDate, LocalDate endDate) {
        List<Booking> filteredBookings = validBookings.stream()
                .filter(b -> {
                    LocalDate bDate = b.getCreatedAt() != null ? b.getCreatedAt().toLocalDate() : LocalDate.now();
                    if (b.getDetails() != null && !b.getDetails().isEmpty() && b.getDetails().get(0).getBookingDate() != null) {
                        bDate = b.getDetails().get(0).getBookingDate();
                    }
                    return !bDate.isBefore(startDate) && !bDate.isAfter(endDate);
                })
                .collect(Collectors.toList());

        Map<UUID, List<Booking>> bookingsByVenue = filteredBookings.stream()
                .filter(b -> b.getVenue() != null)
                .collect(Collectors.groupingBy(b -> b.getVenue().getId()));

        List<PartnerDataDto> list = new ArrayList<>();
        for (Venue v : allVenues) {
            List<Booking> venueBookings = bookingsByVenue.getOrDefault(v.getId(), Collections.emptyList());
            int successfulBookings = venueBookings.size();
            double venueGmv = venueBookings.stream()
                    .mapToDouble(b -> b.getFinalPrice() != null ? b.getFinalPrice() : 0.0)
                    .sum();
            double venueCommission = venueGmv * 0.10;

            String ownerName = "Chủ Sân Sporta";
            if (v.getOwner() != null) {
                if (v.getOwner().getFullName() != null && !v.getOwner().getFullName().isEmpty()) {
                    ownerName = v.getOwner().getFullName();
                } else if (v.getOwner().getUser() != null && v.getOwner().getUser().getFullName() != null) {
                    ownerName = v.getOwner().getUser().getFullName();
                }
            }

            list.add(PartnerDataDto.builder()
                    .id(v.getId().toString())
                    .courtName(v.getName())
                    .ownerName(ownerName)
                    .successfulBookings(successfulBookings)
                    .totalGmv(venueGmv)
                    .commission(venueCommission)
                    .build());
        }

        list.sort((a, b) -> {
            int gmvCompare = Double.compare(b.getTotalGmv(), a.getTotalGmv());
            if (gmvCompare != 0) return gmvCompare;
            return Integer.compare(b.getSuccessfulBookings(), a.getSuccessfulBookings());
        });

        return list;
    }

    private List<Booking> filterBookingsByDateRange(List<Booking> bookings, LocalDate startDate, LocalDate endDate) {
        return bookings.stream()
                .filter(b -> {
                    LocalDate bDate = b.getCreatedAt() != null ? b.getCreatedAt().toLocalDate() : LocalDate.now();
                    if (b.getDetails() != null && !b.getDetails().isEmpty() && b.getDetails().get(0).getBookingDate() != null) {
                        bDate = b.getDetails().get(0).getBookingDate();
                    }
                    return !bDate.isBefore(startDate) && !bDate.isAfter(endDate);
                })
                .collect(Collectors.toList());
    }
}
