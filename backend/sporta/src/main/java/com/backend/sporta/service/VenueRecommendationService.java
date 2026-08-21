package com.backend.sporta.service;

import com.backend.sporta.dto.RecommendedVenueResponse;
import com.backend.sporta.entity.RecommendationDailyMetric;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface VenueRecommendationService {

    List<RecommendedVenueResponse> getPersonalizedRecommendations(
            String userEmail,
            Double latitude,
            Double longitude,
            Long sportId,
            Integer limit
    );

    void recordClick(UUID venueId, String userEmail);

    void recordBooking(UUID venueId, String userEmail);

    RecommendationDailyMetric calculateDailyMetrics(LocalDate reportDate);

    List<RecommendationDailyMetric> getRecentMetrics();
}
