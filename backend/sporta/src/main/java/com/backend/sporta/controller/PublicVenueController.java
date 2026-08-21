package com.backend.sporta.controller;

import com.backend.sporta.dto.RecommendedVenueResponse;
import com.backend.sporta.dto.SlotResponse;
import com.backend.sporta.dto.VenueDetailResponse;
import com.backend.sporta.dto.VenueResponse;
import com.backend.sporta.dto.VenueSearchCriteriaDTO;
import com.backend.sporta.entity.RecommendationDailyMetric;
import com.backend.sporta.service.VenueRecommendationService;
import com.backend.sporta.service.VenueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

    @Autowired
    private VenueRecommendationService recommendationService;

    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getName().equalsIgnoreCase("anonymousUser")) {
            return auth.getName();
        }
        return null;
    }

    /**
     * GET /api/v1/public/venues/recommendations — Hệ thống gợi ý sân cá nhân hóa (Hybrid AI)
     */
    @GetMapping("/recommendations")
    public ResponseEntity<List<RecommendedVenueResponse>> getRecommendedVenues(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) Long sportId,
            @RequestParam(defaultValue = "6") Integer limit
    ) {
        return ResponseEntity.ok(recommendationService.getPersonalizedRecommendations(
                getCurrentUserEmail(), lat, lng, sportId, limit
        ));
    }

    /**
     * POST /api/v1/public/venues/recommendations/{id}/click — Ghi nhận tương tác click vào sân gợi ý
     */
    @PostMapping("/recommendations/{id}/click")
    public ResponseEntity<Void> recordRecommendationClick(@PathVariable UUID id) {
        recommendationService.recordClick(id, getCurrentUserEmail());
        return ResponseEntity.ok().build();
    }

    /**
     * GET /api/v1/public/venues/recommendations/metrics — Thống kê CTR và Precision@K hàng ngày
     */
    @GetMapping("/recommendations/metrics")
    public ResponseEntity<List<RecommendationDailyMetric>> getRecommendationMetrics() {
        return ResponseEntity.ok(recommendationService.getRecentMetrics());
    }

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
