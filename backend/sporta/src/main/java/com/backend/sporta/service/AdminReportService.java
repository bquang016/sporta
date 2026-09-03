package com.backend.sporta.service;

import com.backend.sporta.dto.AdminSportsAnalyticsResponse;
import com.backend.sporta.dto.AdminSportsAnalyticsResponse.RegionAnalyticsItem;
import com.backend.sporta.dto.AdminSportsAnalyticsResponse.SportAnalyticsItem;
import com.backend.sporta.entity.Booking;
import com.backend.sporta.entity.Sport;
import com.backend.sporta.entity.Venue;
import com.backend.sporta.enums.BookingStatus;
import com.backend.sporta.repository.BookingRepository;
import com.backend.sporta.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminReportService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Transactional(readOnly = true)
    public AdminSportsAnalyticsResponse getAdminSportsAnalytics(LocalDate fromDate, LocalDate toDate) {
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

        List<Booking> allBookings = bookingRepository.findAll();
        LocalDate finalFromDate = fromDate;
        LocalDate finalToDate = toDate;

        List<Booking> validBookings = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED || b.getStatus() == BookingStatus.CONFIRMED)
                .filter(b -> {
                    LocalDate bDate = b.getCreatedAt() != null ? b.getCreatedAt().toLocalDate() : LocalDate.now();
                    if (b.getDetails() != null && !b.getDetails().isEmpty() && b.getDetails().get(0).getBookingDate() != null) {
                        bDate = b.getDetails().get(0).getBookingDate();
                    }
                    return !bDate.isBefore(finalFromDate) && !bDate.isAfter(finalToDate);
                })
                .collect(Collectors.toList());

        double totalGmv = validBookings.stream()
                .mapToDouble(b -> b.getFinalPrice() != null ? b.getFinalPrice() : 0.0)
                .sum();
        double totalCommission = totalGmv * 0.10;

        // Group by Sport
        Map<String, Double> sportGmvMap = new HashMap<>();
        Map<String, Integer> sportCountMap = new HashMap<>();
        Map<String, Long> sportIdMap = new HashMap<>();

        for (Booking b : validBookings) {
            double price = b.getFinalPrice() != null ? b.getFinalPrice() : 0.0;
            String sportName = "Khác";
            Long sportId = 0L;

            if (b.getVenue() != null && b.getVenue().getSport() != null) {
                Sport sport = b.getVenue().getSport();
                sportName = sport.getName() != null ? sport.getName() : "Khác";
                sportId = sport.getId();
            }

            sportGmvMap.put(sportName, sportGmvMap.getOrDefault(sportName, 0.0) + price);
            sportCountMap.put(sportName, sportCountMap.getOrDefault(sportName, 0) + 1);
            sportIdMap.put(sportName, sportId);
        }

        List<SportAnalyticsItem> sportsBreakdown = new ArrayList<>();
        for (String sportName : sportGmvMap.keySet()) {
            double gmv = sportGmvMap.get(sportName);
            double pct = totalGmv > 0 ? Math.round((gmv * 100.0 / totalGmv) * 10.0) / 10.0 : 0.0;
            sportsBreakdown.add(SportAnalyticsItem.builder()
                    .sportId(sportIdMap.get(sportName))
                    .sportName(sportName)
                    .totalGmv(gmv)
                    .percentage(pct)
                    .bookingCount(sportCountMap.get(sportName))
                    .build());
        }
        sportsBreakdown.sort((a, b) -> Double.compare(b.getTotalGmv(), a.getTotalGmv()));

        // Group by Region / Province
        Map<String, Double> regionGmvMap = new HashMap<>();
        Map<String, Set<UUID>> regionVenueMap = new HashMap<>();

        for (Booking b : validBookings) {
            double price = b.getFinalPrice() != null ? b.getFinalPrice() : 0.0;
            String province = "Khác";
            UUID vId = null;

            if (b.getVenue() != null) {
                province = b.getVenue().getProvince() != null && !b.getVenue().getProvince().isEmpty()
                        ? b.getVenue().getProvince()
                        : "Khác";
                vId = b.getVenue().getId();
            }

            regionGmvMap.put(province, regionGmvMap.getOrDefault(province, 0.0) + price);
            if (!regionVenueMap.containsKey(province)) {
                regionVenueMap.put(province, new HashSet<>());
            }
            if (vId != null) {
                regionVenueMap.get(province).add(vId);
            }
        }

        List<RegionAnalyticsItem> regionBreakdown = new ArrayList<>();
        for (String province : regionGmvMap.keySet()) {
            double gmv = regionGmvMap.get(province);
            double pct = totalGmv > 0 ? Math.round((gmv * 100.0 / totalGmv) * 10.0) / 10.0 : 0.0;
            regionBreakdown.add(RegionAnalyticsItem.builder()
                    .provinceName(province)
                    .totalGmv(gmv)
                    .percentage(pct)
                    .venueCount(regionVenueMap.get(province).size())
                    .build());
        }
        regionBreakdown.sort((a, b) -> Double.compare(b.getTotalGmv(), a.getTotalGmv()));

        return AdminSportsAnalyticsResponse.builder()
                .fromDate(fromDate)
                .toDate(toDate)
                .totalPlatformGmv(totalGmv)
                .totalPlatformCommission(totalCommission)
                .sportsBreakdown(sportsBreakdown)
                .regionBreakdown(regionBreakdown)
                .build();
    }
}
