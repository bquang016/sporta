package com.backend.sporta.controller;

import com.backend.sporta.dto.OwnerDashboardResponse;
import com.backend.sporta.service.OwnerDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/owner/dashboard")
@CrossOrigin(origins = "*")
public class OwnerDashboardController {

    @Autowired
    private OwnerDashboardService ownerDashboardService;

    @GetMapping("/overview")
    public ResponseEntity<OwnerDashboardResponse> getDashboardOverview(
            @RequestParam(value = "venueId", required = false, defaultValue = "all") String venueId,
            @RequestParam(value = "period", required = false, defaultValue = "day") String period) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        OwnerDashboardResponse response = ownerDashboardService.getDashboardOverview(email, venueId, period);
        return ResponseEntity.ok(response);
    }
}
