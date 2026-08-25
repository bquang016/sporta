package com.backend.sporta.controller;

import com.backend.sporta.dto.VenueStatisticsResponse;
import com.backend.sporta.service.OwnerStatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/owner/venues")
@CrossOrigin(origins = "*")
public class OwnerStatisticsController {

    @Autowired
    private OwnerStatisticsService ownerStatisticsService;

    /**
     * GET /api/v1/owner/venues/{venueId}/statistics?from=YYYY-MM-DD&to=YYYY-MM-DD
     * Lấy dữ liệu thống kê, doanh thu, tỉ lệ lấp đầy thực tế cho chủ sân.
     */
    @GetMapping("/{venueId}/statistics")
    public ResponseEntity<VenueStatisticsResponse> getVenueStatistics(
            @PathVariable("venueId") UUID venueId,
            @RequestParam(value = "from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(value = "to", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        VenueStatisticsResponse response = ownerStatisticsService.getVenueStatistics(venueId, from, to, email);
        return ResponseEntity.ok(response);
    }
}
