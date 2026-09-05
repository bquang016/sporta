package com.backend.sporta.controller;

import com.backend.sporta.dto.AdminSportsAnalyticsResponse;
import com.backend.sporta.service.AdminReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/admin/reports")
@CrossOrigin(origins = "*")
public class AdminReportController {

    @Autowired
    private AdminReportService adminReportService;

    @GetMapping("/analytics")
    public ResponseEntity<AdminSportsAnalyticsResponse> getSportsAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        AdminSportsAnalyticsResponse response = adminReportService.getAdminSportsAnalytics(from, to);
        return ResponseEntity.ok(response);
    }
}
