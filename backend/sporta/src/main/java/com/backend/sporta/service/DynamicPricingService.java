package com.backend.sporta.service;

import com.backend.sporta.dto.ApplyPricingRequest;
import com.backend.sporta.dto.PricingAnalyticsSummaryResponse;
import com.backend.sporta.dto.PricingRecommendationResponse;
import com.backend.sporta.dto.RejectPricingRequest;

import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface DynamicPricingService {

    /**
     * Chạy batch job phân tích toàn bộ sân active trong hệ thống, sinh recommendation mới và cập nhật cache.
     */
    void runDailyDynamicPricingBatch();

    /**
     * Tính toán động $OR$ trung bình theo từng môn thể thao trong 6 tuần qua và lưu cache.
     */
    Map<String, Double> calculateAndCacheSportBenchmarks();

    /**
     * Lấy danh sách các đề xuất giá PENDING cho một Venue thuộc quyền quản lý của Owner.
     */
    List<PricingRecommendationResponse> getRecommendationsForVenue(UUID venueId, String ownerEmail);

    /**
     * Chủ sân phê duyệt áp dụng 1 hoặc nhiều đề xuất giá vào CourtPriceRule thật.
     */
    void applyRecommendations(ApplyPricingRequest request, String ownerEmail);

    /**
     * Chủ sân từ chối đề xuất giá.
     */
    void rejectRecommendations(RejectPricingRequest request, String ownerEmail);

    /**
     * Lấy dữ liệu Heatmap tỷ lệ lấp đầy và thống kê Acceptance Rate cho Venue (hỗ trợ lọc theo courtId và dayOfWeek).
     */
    PricingAnalyticsSummaryResponse getPricingAnalytics(UUID venueId, UUID courtId, Integer dayOfWeek, String ownerEmail);

    // ================= MATH ENGINE EXPOSED FOR DETERMINISTIC TESTING =================

    double calculateOccupancyFactor(double occupancyRate);

    double calculateDayFactor(int dayOfWeek);

    double calculateTimeSlotFactor(int dayOfWeek, LocalTime slotTime);

    double calculateFinalSuggestedPrice(double basePrice, double dayFactor, double timeSlotFactor, double occupancyFactor);
}
