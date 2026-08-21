package com.backend.sporta.service;

import com.backend.sporta.config.RecommendationProperties;
import com.backend.sporta.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class VenueRecommendationServiceTest {

    @Mock
    private VenueRepository venueRepository;
    @Mock
    private CourtRepository courtRepository;
    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private RecommendationLogRepository recommendationLogRepository;
    @Mock
    private RecommendationDailyMetricRepository dailyMetricRepository;

    private RecommendationProperties properties;
    private VenueRecommendationServiceImpl service;

    @BeforeEach
    void setUp() {
        properties = new RecommendationProperties();
        service = new VenueRecommendationServiceImpl(
                venueRepository,
                courtRepository,
                bookingRepository,
                userRepository,
                recommendationLogRepository,
                dailyMetricRepository,
                properties
        );
    }

    @Test
    @DisplayName("Haversine: Khoảng cách giữa 2 điểm trùng nhau phải bằng 0")
    void testHaversineDistance_SameLocation_ReturnsZero() {
        double d = service.calculateHaversineDistance(21.0285, 105.8542, 21.0285, 105.8542);
        assertEquals(0.0, d, 0.001);
    }

    @Test
    @DisplayName("Haversine: Khoảng cách Hà Nội (21.0285, 105.8542) đến Hải Phòng (20.8449, 106.6881) ~ 90-100km")
    void testHaversineDistance_HanoiToHaiPhong() {
        double d = service.calculateHaversineDistance(21.0285, 105.8542, 20.8449, 106.6881);
        assertTrue(d > 85.0 && d < 105.0, "Khoảng cách thực tế phải nằm trong khoảng 85km - 105km: " + d);
    }

    @Test
    @DisplayName("Gaussian Decay: Tại d = 0, điểm khoảng cách phải bằng 1.0")
    void testGaussianDecay_ZeroDistance_ReturnsOne() {
        double s = service.calculateGaussianDistanceScore(0.0, 3.5);
        assertEquals(1.0, s, 0.0001);
    }

    @Test
    @DisplayName("Gaussian Decay: Tại d = sigma = 3.5km, điểm khoảng cách e^(-0.5) ~ 0.606")
    void testGaussianDecay_SigmaDistance_ReturnsApproxSixtyPercent() {
        double s = service.calculateGaussianDistanceScore(3.5, 3.5);
        assertEquals(Math.exp(-0.5), s, 0.001);
        assertTrue(s > 0.60 && s < 0.61);
    }

    @Test
    @DisplayName("Gaussian Decay: Tại khoảng cách xa d = 15km, điểm khoảng cách phải tiệm cận 0")
    void testGaussianDecay_FarDistance_ReturnsNearZero() {
        double s = service.calculateGaussianDistanceScore(15.0, 3.5);
        assertTrue(s < 0.001, "Điểm ở cự ly 15km phải < 0.001: " + s);
    }

    @Test
    @DisplayName("Bounding Box: Delta Lng phải lớn hơn Delta Lat ở vĩ độ dương do cosin co lại")
    void testBoundingBox_LatitudeCorrection() {
        double lat = 21.0285;
        double lng = 105.8542;
        double[] box = service.calculateBoundingBox(lat, lng, 15.0);

        double deltaLat = (box[1] - box[0]) / 2.0;
        double deltaLng = (box[3] - box[2]) / 2.0;

        assertTrue(deltaLng > deltaLat, "Delta Lng (" + deltaLng + ") phải lớn hơn Delta Lat (" + deltaLat + ") tại vĩ độ 21 độ");
    }

    @Test
    @DisplayName("Price Affinity: Khi giá sân = giá thói quen user, điểm phải bằng 1.0")
    void testPriceAffinity_ExactMatch_ReturnsOne() {
        double s = service.calculatePriceAffinityScore(200000.0, 200000.0, 250000.0);
        assertEquals(1.0, s, 0.001);
    }

    @Test
    @DisplayName("Price Affinity: Khi chênh lệch lớn hơn priceRange, điểm bị clamp ở 0.0")
    void testPriceAffinity_LargeDiff_ReturnsZero() {
        double s = service.calculatePriceAffinityScore(600000.0, 200000.0, 250000.0);
        assertEquals(0.0, s, 0.001);
    }

    @Test
    @DisplayName("Sport Match: Đúng môn chính = 1.0, môn phụ = 0.6, môn chưa chơi = 0.1")
    void testSportMatch_GradedScores() {
        Set<Long> secondary = new HashSet<>();
        secondary.add(2L);
        secondary.add(3L);

        assertEquals(1.0, service.calculateSportMatchScore(1L, 1L, secondary), 0.001);
        assertEquals(0.6, service.calculateSportMatchScore(2L, 1L, secondary), 0.001);
        assertEquals(0.1, service.calculateSportMatchScore(99L, 1L, secondary), 0.001);
    }

    @Test
    @DisplayName("History Score: Đặt 1 lần = 0.33, 2 lần = 0.67, >=3 lần = 1.0")
    void testHistoryScore() {
        assertEquals(1.0 / 3.0, service.calculateHistoryScore(1), 0.01);
        assertEquals(2.0 / 3.0, service.calculateHistoryScore(2), 0.01);
        assertEquals(1.0, service.calculateHistoryScore(3), 0.001);
        assertEquals(1.0, service.calculateHistoryScore(5), 0.001);
    }
}
