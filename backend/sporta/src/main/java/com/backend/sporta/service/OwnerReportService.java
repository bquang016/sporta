package com.backend.sporta.service;

import com.backend.sporta.dto.OwnerRevenueReportResponse;
import com.backend.sporta.dto.OwnerRevenueReportResponse.DailyRevenuePoint;
import com.backend.sporta.entity.Booking;
import com.backend.sporta.entity.Venue;
import com.backend.sporta.enums.BookingStatus;
import com.backend.sporta.exception.CustomException;
import com.backend.sporta.repository.BookingRepository;
import com.backend.sporta.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OwnerReportService {

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Transactional(readOnly = true)
    public OwnerRevenueReportResponse getOwnerRevenueReport(UUID venueId, LocalDate fromDate, LocalDate toDate, String ownerEmail) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin cụm sân", 404));

        if (venue.getOwner() == null || venue.getOwner().getUser() == null ||
                !venue.getOwner().getUser().getEmail().equals(ownerEmail)) {
            throw new CustomException("Bạn không có quyền truy cập dữ liệu báo cáo của cụm sân này", 403);
        }

        // Mặc định khoảng ngày nếu không truyền (Tháng này)
        LocalDate today = LocalDate.now();
        if (fromDate == null) {
            fromDate = today.withDayOfMonth(1);
        }
        if (toDate == null) {
            toDate = today;
        }
        if (toDate.isBefore(fromDate)) {
            LocalDate temp = fromDate;
            fromDate = toDate;
            toDate = temp;
        }

        List<BookingStatus> validStatuses = Arrays.asList(BookingStatus.CONFIRMED, BookingStatus.COMPLETED);
        List<Booking> bookings = bookingRepository.findBookingsByVenueAndDateRange(venueId, fromDate, toDate, validStatuses);

        double totalGmv = 0.0;
        double bookingSingleAmount = 0.0;
        double bookingFixedAmount = 0.0;
        double ticketSessionAmount = 0.0;

        double payosAmount = 0.0;
        double walletAmount = 0.0;
        double cashAmount = 0.0;

        Map<String, Double> dailyGmvMap = new TreeMap<>();
        Map<String, Integer> dailyCountMap = new TreeMap<>();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");
        LocalDate curr = fromDate;
        while (!curr.isAfter(toDate)) {
            String key = curr.format(formatter);
            dailyGmvMap.put(key, 0.0);
            dailyCountMap.put(key, 0);
            curr = curr.plusDays(1);
        }

        for (Booking b : bookings) {
            double price = b.getFinalPrice() != null ? b.getFinalPrice() : 0.0;
            totalGmv += price;

            // Group by payment method
            String pMethod = b.getPaymentMethod() != null ? b.getPaymentMethod().toUpperCase() : "CASH";
            if (pMethod.contains("PAYOS") || pMethod.contains("VNPAY") || pMethod.contains("BANK")) {
                payosAmount += price;
            } else if (pMethod.contains("WALLET")) {
                walletAmount += price;
            } else {
                cashAmount += price;
            }

            // Group by source (Fixed schedule vs Single booking)
            if (b.getDetails() != null && b.getDetails().size() > 2) {
                bookingFixedAmount += price;
            } else {
                bookingSingleAmount += price;
            }

            // Group by day for timeline
            LocalDate bDate = b.getCreatedAt() != null ? b.getCreatedAt().toLocalDate() : fromDate;
            if (b.getDetails() != null && !b.getDetails().isEmpty() && b.getDetails().get(0).getBookingDate() != null) {
                bDate = b.getDetails().get(0).getBookingDate();
            }

            String dateKey = bDate.format(formatter);
            if (dailyGmvMap.containsKey(dateKey)) {
                dailyGmvMap.put(dateKey, dailyGmvMap.get(dateKey) + price);
                dailyCountMap.put(dateKey, dailyCountMap.get(dateKey) + 1);
            }
        }

        double commissionFee = totalGmv * 0.10;
        double netRevenue = totalGmv - commissionFee;
        int totalBookings = bookings.size();
        double aov = totalBookings > 0 ? totalGmv / totalBookings : 0.0;

        List<DailyRevenuePoint> dailyTimeline = new ArrayList<>();
        for (String key : dailyGmvMap.keySet()) {
            double dayGmv = dailyGmvMap.get(key);
            dailyTimeline.add(DailyRevenuePoint.builder()
                    .date(key)
                    .gmv(dayGmv)
                    .netRevenue(dayGmv * 0.90)
                    .bookingCount(dailyCountMap.get(key))
                    .build());
        }

        return OwnerRevenueReportResponse.builder()
                .venueId(venue.getId())
                .venueName(venue.getName())
                .fromDate(fromDate)
                .toDate(toDate)
                .totalGmv(totalGmv)
                .netRevenue(netRevenue)
                .commissionFee(commissionFee)
                .totalBookings(totalBookings)
                .averageOrderValue(aov)
                .bookingSingleAmount(bookingSingleAmount)
                .bookingFixedAmount(bookingFixedAmount)
                .ticketSessionAmount(ticketSessionAmount)
                .payosAmount(payosAmount)
                .walletAmount(walletAmount)
                .cashAmount(cashAmount)
                .dailyTimeline(dailyTimeline)
                .build();
    }
}
