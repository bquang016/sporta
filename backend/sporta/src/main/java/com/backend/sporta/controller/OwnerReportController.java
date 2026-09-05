package com.backend.sporta.controller;

import com.backend.sporta.dto.OwnerRevenueReportResponse;
import com.backend.sporta.service.OwnerReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/owner/venues")
@CrossOrigin(origins = "*")
public class OwnerReportController {

    @Autowired
    private OwnerReportService ownerReportService;

    @GetMapping("/{venueId}/reports/revenue")
    public ResponseEntity<OwnerRevenueReportResponse> getRevenueReport(
            @PathVariable UUID venueId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            Authentication authentication) {
        String email = authentication != null ? authentication.getName() : "";
        OwnerRevenueReportResponse response = ownerReportService.getOwnerRevenueReport(venueId, from, to, email);
        return ResponseEntity.ok(response);
    }
}
