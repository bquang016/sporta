package com.backend.sporta.service;

import com.backend.sporta.dto.CourtStatisticsDto;
import com.backend.sporta.dto.VenueStatisticsResponse;
import com.backend.sporta.entity.Booking;
import com.backend.sporta.entity.BookingDetail;
import com.backend.sporta.entity.Court;
import com.backend.sporta.entity.Venue;
import com.backend.sporta.enums.BookingStatus;
import com.backend.sporta.enums.CourtStatus;
import com.backend.sporta.exception.CustomException;
import com.backend.sporta.repository.BookingDetailRepository;
import com.backend.sporta.repository.BookingRepository;
import com.backend.sporta.repository.CourtRepository;
import com.backend.sporta.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OwnerStatisticsService {

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private CourtRepository courtRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingDetailRepository bookingDetailRepository;

    @Transactional(readOnly = true)
    public VenueStatisticsResponse getVenueStatistics(UUID venueId, LocalDate fromDate, LocalDate toDate, String ownerEmail) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin cụm sân", 404));

        if (venue.getOwner() == null || venue.getOwner().getUser() == null ||
                !venue.getOwner().getUser().getEmail().equals(ownerEmail)) {
            throw new CustomException("Bạn không có quyền truy cập dữ liệu thống kê của cụm sân này", 403);
        }

        // Mặc định khoảng ngày nếu không truyền
        if (fromDate == null) {
            fromDate = LocalDate.now();
        }
        if (toDate == null) {
            toDate = fromDate;
        }
        if (toDate.isBefore(fromDate)) {
            LocalDate temp = fromDate;
            fromDate = toDate;
            toDate = temp;
        }

        List<Court> courts = courtRepository.findByVenueId(venueId);
        List<BookingStatus> validStatuses = Arrays.asList(BookingStatus.CONFIRMED, BookingStatus.COMPLETED);

        // 1. Tính toán số slot khả dụng trong ngày cho mỗi sân
        LocalTime opening = venue.getOpeningTime() != null ? venue.getOpeningTime() : LocalTime.of(6, 0);
        LocalTime closing = venue.getClosingTime() != null ? venue.getClosingTime() : LocalTime.of(22, 0);
        int shiftDuration = venue.getShiftDurationMinutes() != null && venue.getShiftDurationMinutes() > 0 
                ? venue.getShiftDurationMinutes() 
                : 30;

        long operatingMinutes;
        if (closing.isAfter(opening)) {
            operatingMinutes = ChronoUnit.MINUTES.between(opening, closing);
        } else {
            operatingMinutes = (24 * 60 - opening.toSecondOfDay() / 60) + (closing.toSecondOfDay() / 60);
        }

        int dailySlotsPerCourt = Math.max(1, (int) (operatingMinutes / shiftDuration));
        long numberOfDays = ChronoUnit.DAYS.between(fromDate, toDate) + 1;
        int totalSlotsPerCourt = (int) (dailySlotsPerCourt * numberOfDays);

        // 2. Lấy dữ liệu Booking và BookingDetail thực tế trong khoảng ngày
        List<Booking> bookings = bookingRepository.findBookingsByVenueAndDateRange(venueId, fromDate, toDate, validStatuses);
        List<BookingDetail> bookingDetails = bookingDetailRepository.findValidBookingDetailsInDateRange(venueId, fromDate, toDate, validStatuses);

        // Nhóm booking details theo courtId
        Map<UUID, List<BookingDetail>> detailsByCourt = bookingDetails.stream()
                .filter(d -> d.getCourt() != null)
                .collect(Collectors.groupingBy(d -> d.getCourt().getId()));

        // 3. Xây dựng thống kê từng sân
        List<CourtStatisticsDto> courtStatsList = new ArrayList<>();
        int activeCourtsCount = 0;
        int maintenanceCourtsCount = 0;

        for (Court court : courts) {
            if (court.getStatus() == CourtStatus.ACTIVE) {
                activeCourtsCount++;
            } else {
                maintenanceCourtsCount++;
            }

            List<BookingDetail> courtDetails = detailsByCourt.getOrDefault(court.getId(), Collections.emptyList());
            int bookedSlots = courtDetails.size();
            double courtRevenue = courtDetails.stream().mapToDouble(BookingDetail::getPrice).sum();
            int courtBookingCount = (int) courtDetails.stream().map(d -> d.getBooking().getId()).distinct().count();

            double occupancyRate = totalSlotsPerCourt > 0 
                    ? Math.round((bookedSlots * 100.0 / totalSlotsPerCourt) * 10.0) / 10.0 
                    : 0.0;

            courtStatsList.add(CourtStatisticsDto.builder()
                    .courtId(court.getId())
                    .courtName(court.getName())
                    .courtStatus(court.getStatus())
                    .price(court.getPrice())
                    .totalSlots(totalSlotsPerCourt)
                    .bookedSlots(bookedSlots)
                    .occupancyRate(occupancyRate)
                    .revenue(courtRevenue)
                    .bookingCount(courtBookingCount)
                    .build());
        }

        // 4. Tổng hợp toàn cụm sân
        int totalVenueSlots = totalSlotsPerCourt * courts.size();
        int totalBookedSlots = bookingDetails.size();
        double totalRevenue = bookings.stream().mapToDouble(Booking::getFinalPrice).sum();
        
        // Nếu không có finalPrice từ Booking cha thì fallback qua tổng doanh thu từ details
        if (totalRevenue == 0.0 && !bookingDetails.isEmpty()) {
            totalRevenue = bookingDetails.stream().mapToDouble(BookingDetail::getPrice).sum();
        }

        double averageOccupancy = totalVenueSlots > 0 
                ? Math.round((totalBookedSlots * 100.0 / totalVenueSlots) * 10.0) / 10.0 
                : 0.0;

        return VenueStatisticsResponse.builder()
                .venueId(venue.getId())
                .venueName(venue.getName())
                .fromDate(fromDate)
                .toDate(toDate)
                .totalRevenue(totalRevenue)
                .totalBookings(bookings.size())
                .totalVenueSlots(totalVenueSlots)
                .totalBookedSlots(totalBookedSlots)
                .averageOccupancy(averageOccupancy)
                .activeCourtsCount(activeCourtsCount)
                .maintenanceCourtsCount(maintenanceCourtsCount)
                .totalCourtsCount(courts.size())
                .courtStats(courtStatsList)
                .build();
    }
}
