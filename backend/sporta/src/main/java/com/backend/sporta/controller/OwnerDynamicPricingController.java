package com.backend.sporta.controller;

import com.backend.sporta.dto.ApplyPricingRequest;
import com.backend.sporta.dto.PricingAnalyticsSummaryResponse;
import com.backend.sporta.dto.PricingRecommendationResponse;
import com.backend.sporta.dto.RejectPricingRequest;
import com.backend.sporta.service.DynamicPricingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/owner/pricing-recommendations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OwnerDynamicPricingController {

    private final DynamicPricingService dynamicPricingService;

    /**
     * Lấy danh sách các đề xuất giá đang chờ duyệt (PENDING) của một cơ sở thể thao.
     */
    @GetMapping("/venue/{venueId}")
    public ResponseEntity<List<PricingRecommendationResponse>> getVenueRecommendations(
            @PathVariable("venueId") UUID venueId
    ) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<PricingRecommendationResponse> response = dynamicPricingService.getRecommendationsForVenue(venueId, email);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy dữ liệu Heatmap tỷ lệ lấp đầy và thống kê Acceptance Rate của một cơ sở thể thao (hỗ trợ lọc theo sân & thứ).
     */
    @GetMapping("/venue/{venueId}/analytics")
    public ResponseEntity<PricingAnalyticsSummaryResponse> getVenuePricingAnalytics(
            @PathVariable("venueId") UUID venueId,
            @RequestParam(value = "courtId", required = false) UUID courtId,
            @RequestParam(value = "dayOfWeek", required = false) Integer dayOfWeek
    ) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        PricingAnalyticsSummaryResponse response = dynamicPricingService.getPricingAnalytics(venueId, courtId, dayOfWeek, email);
        return ResponseEntity.ok(response);
    }

    /**
     * Chủ sân bấm phê duyệt áp dụng giá thật vào hệ thống CourtPriceRule.
     */
    @PostMapping("/apply")
    public ResponseEntity<?> applyPricingRecommendations(
            @Valid @RequestBody ApplyPricingRequest request
    ) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        dynamicPricingService.applyRecommendations(request, email);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đã áp dụng mức giá mới vào hệ thống thành công!"
        ));
    }

    /**
     * Chủ sân từ chối đề xuất giá.
     */
    @PostMapping("/reject")
    public ResponseEntity<?> rejectPricingRecommendations(
            @Valid @RequestBody RejectPricingRequest request
    ) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        dynamicPricingService.rejectRecommendations(request, email);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đã từ chối các đề xuất giá đã chọn."
        ));
    }

    /**
     * Endpoint hỗ trợ kích hoạt chạy lại batch phân tích định giá ngay lập tức (Trigger on demand).
     */
    @PostMapping("/trigger-batch")
    public ResponseEntity<?> triggerDynamicPricingBatch() {
        dynamicPricingService.runDailyDynamicPricingBatch();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đã kích hoạt chạy batch định giá động thành công!"
        ));
    }
}
