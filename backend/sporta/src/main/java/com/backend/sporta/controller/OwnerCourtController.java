package com.backend.sporta.controller;

import com.backend.sporta.dto.CourtRequest;
import com.backend.sporta.dto.CourtResponse;
import com.backend.sporta.dto.CourtPriceRuleRequest;
import com.backend.sporta.dto.CourtPriceRuleResponse;
import com.backend.sporta.enums.CourtStatus;
import com.backend.sporta.service.CourtService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/owner/courts")
@CrossOrigin(origins = "*")
public class OwnerCourtController {

    @Autowired
    private CourtService courtService;

    @GetMapping
    public ResponseEntity<List<CourtResponse>> getOwnerCourts() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<CourtResponse> response = courtService.getCourtsByOwnerEmail(email);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourtResponse> getCourtDetail(@PathVariable("id") UUID id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        CourtResponse response = courtService.getCourtByIdAndOwnerEmail(id, email);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<CourtResponse> registerCourt(@Valid @RequestBody CourtRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        CourtResponse response = courtService.registerCourt(request, email);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourtResponse> updateCourt(
            @PathVariable("id") UUID id,
            @Valid @RequestBody CourtRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        CourtResponse response = courtService.updateCourt(id, request, email);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<CourtResponse> updateStatus(
            @PathVariable("id") UUID id,
            @RequestParam("status") CourtStatus status) {
        CourtResponse response = courtService.updateCourtStatus(id, status);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/price-rules")
    public ResponseEntity<List<CourtPriceRuleResponse>> getCourtPriceRules(@PathVariable("id") UUID id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<CourtPriceRuleResponse> response = courtService.getPriceRulesByCourtId(id, email);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/price-rules")
    public ResponseEntity<?> saveCourtPriceRules(
            @PathVariable("id") UUID id,
            @RequestBody List<CourtPriceRuleRequest> request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        courtService.savePriceRules(id, request, email);
        return ResponseEntity.ok(java.util.Map.of("message", "Lưu cấu hình giá thành công"));
    }
}
