package com.backend.sporta.controller;

import com.backend.sporta.dto.SlotResponse;
import com.backend.sporta.dto.VenueDetailResponse;
import com.backend.sporta.dto.VenueResponse;
import com.backend.sporta.dto.VenueSearchCriteriaDTO;
import com.backend.sporta.service.VenueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/public/venues")
@CrossOrigin(origins = "*")
public class PublicVenueController {

    @Autowired
    private VenueService venueService;


    /** POST /api/v1/public/venues/search — Tìm kiếm và lọc cụm sân */
    @PostMapping("/search")
    public ResponseEntity<List<VenueResponse>> searchVenues(@RequestBody VenueSearchCriteriaDTO criteria) {
        return ResponseEntity.ok(venueService.searchVenues(criteria));
    }

    /** GET /api/v1/public/venues — Danh sách tất cả venue đang ACTIVE */
    @GetMapping
    public ResponseEntity<List<VenueResponse>> getAllActiveVenues() {
        return ResponseEntity.ok(venueService.getAllActiveVenues());
    }

    /** GET /api/v1/public/venues/{id} — Chi tiết venue kèm courts + priceRules */
    @GetMapping("/{id}")
    public ResponseEntity<VenueDetailResponse> getVenueDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(venueService.getVenueDetail(id));
    }

    /**
     * GET /api/v1/public/venues/{id}/schedule?date=YYYY-MM-DD
     * Trả lưới slot với status (available/booked/locked) và giá đã tính theo priceRules.
     */
    @GetMapping("/{id}/schedule")
    public ResponseEntity<List<SlotResponse>> getVenueSchedule(
            @PathVariable UUID id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(venueService.getVenueSchedule(id, date));
    }
}
