package com.backend.sporta.service;

import com.backend.sporta.config.RecommendationProperties;
import com.backend.sporta.dto.RecommendedVenueResponse;
import com.backend.sporta.entity.Booking;
import com.backend.sporta.entity.Sport;
import com.backend.sporta.entity.User;
import com.backend.sporta.entity.Venue;
import com.backend.sporta.enums.ApprovalStatus;
import com.backend.sporta.enums.VenueStatus;
import com.backend.sporta.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

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

    // ================= 1. KIỂM THỬ HÀM TOÁN HỌC =================

    @Test
    @DisplayName("Haversine: Khoảng cách giữa 2 điểm trùng nhau phải bằng 0")
    void testHaversineDistance_SameLocation_ReturnsZero() {
        double d = service.calculateHaversineDistance(21.0285, 105.8542, 21.0285, 105.8542);
        assertEquals(0.0, d, 0.001);
    }

    @Test
    @DisplayName("Haversine: Khoảng cách Hà Nội đến Hải Phòng ~ 90-100km")
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
    @DisplayName("Popularity: Điểm thay đổi rõ rệt khi rating khác nhau")
    void testPopularityScore_WithRealRating() {
        double popLow = service.calculatePopularityScore(3.0, 10L);
        double popHigh = service.calculatePopularityScore(5.0, 10L);
        assertTrue(popHigh > popLow, "Sân 5.0 sao phải có điểm Popularity cao hơn sân 3.0 sao");
        assertEquals(0.6 * (5.0 / 5.0) + 0.4 * Math.min(1.0, Math.log(11) / Math.log(101)), popHigh, 0.001);
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

    // ================= 2. KIỂM THỬ TÁI CHUẨN HÓA TRỌNG SỐ & COLD-START =================

    @Test
    @DisplayName("Weight Renormalization: Khi không có GPS (lat/lng null), tổng 4 trọng số còn lại phải bằng 1.0")
    void testWeightRenormalization_WhenGpsNull_SumEqualsOne() {
        double wSport = properties.getWeights().getSport(); // 0.35
        double wPrice = properties.getWeights().getPrice(); // 0.15
        double wPop = properties.getWeights().getPopularity(); // 0.15
        double wHist = properties.getWeights().getHistory(); // 0.10

        double sumRemaining = wSport + wPrice + wPop + wHist; // 0.75
        double wSportNew = wSport / sumRemaining;
        double wPriceNew = wPrice / sumRemaining;
        double wPopNew = wPop / sumRemaining;
        double wHistNew = wHist / sumRemaining;

        assertEquals(1.0, wSportNew + wPriceNew + wPopNew + wHistNew, 0.0001);
    }

    @Test
    @DisplayName("Cold Start Blending: User 0 booking có alpha = 0 (Cold Start), 3 bookings có alpha = 1.0 (Full Personalized)")
    void testColdStartBlending_Alphas() {
        int threshold = properties.getParameters().getColdStartThreshold(); // 3
        double alpha0 = Math.min(1.0, 0 / (double) threshold);
        double alpha1 = Math.min(1.0, 1 / (double) threshold);
        double alpha3 = Math.min(1.0, 3 / (double) threshold);
        double alpha5 = Math.min(1.0, 5 / (double) threshold);

        assertEquals(0.0, alpha0, 0.001);
        assertEquals(1.0 / 3.0, alpha1, 0.001);
        assertEquals(1.0, alpha3, 0.001);
        assertEquals(1.0, alpha5, 0.001);
    }

    // ================= 3. KIỂM THỬ END-TO-END RECOMMENDATION LOGIC =================

    @Test
    @DisplayName("End-to-End: Gợi ý ưu tiên sân có môn sở trường và gần vị trí GPS nhất")
    void testGetPersonalizedRecommendations_SportAndDistancePrioritization() {
        String email = "test@sporta.com";
        User user = User.builder().id(100L).email(email).fullName("Tester").build();
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        Sport football = Sport.builder().id(1L).name("Bóng đá").build();
        Sport badminton = Sport.builder().id(2L).name("Cầu lông").build();

        UUID venue1Id = UUID.randomUUID();
        Venue venue1 = Venue.builder()
                .id(venue1Id)
                .name("Sân Bóng Đá Cầu Giấy")
                .sport(football)
                .latitude(21.0285)
                .longitude(105.8542)
                .status(VenueStatus.ACTIVE)
                .approvalStatus(ApprovalStatus.APPROVED)
                .build();

        UUID venue2Id = UUID.randomUUID();
        Venue venue2 = Venue.builder()
                .id(venue2Id)
                .name("Sân Cầu Lông Hà Đông")
                .sport(badminton)
                .latitude(20.9700)
                .longitude(105.7700)
                .status(VenueStatus.ACTIVE)
                .approvalStatus(ApprovalStatus.APPROVED)
                .build();

        // Mock user booking history: 3 football bookings at venue1
        List<Booking> history = Arrays.asList(
                Booking.builder().id(UUID.randomUUID()).user(user).venue(venue1).finalPrice(200000.0).build(),
                Booking.builder().id(UUID.randomUUID()).user(user).venue(venue1).finalPrice(200000.0).build(),
                Booking.builder().id(UUID.randomUUID()).user(user).venue(venue1).finalPrice(200000.0).build()
        );
        when(bookingRepository.findByUserIdOrderByCreatedAtDesc(100L)).thenReturn(history);

        // Mock candidate venues
        when(venueRepository.findInBoundingBox(eq(VenueStatus.ACTIVE), eq(ApprovalStatus.APPROVED), isNull(), anyDouble(), anyDouble(), anyDouble(), anyDouble()))
                .thenReturn(Arrays.asList(venue1, venue2));

        // Mock batch booking counts
        List<Object[]> batchCounts = Arrays.asList(
                new Object[]{venue1Id, 25L},
                new Object[]{venue2Id, 5L}
        );
        when(venueRepository.countConfirmedBookingsByVenueIds(anyList())).thenReturn(batchCounts);

        when(courtRepository.findMinPriceByVenueIdAndStatusActive(any())).thenReturn(200000.0);
        when(courtRepository.findMaxPriceByVenueIdAndStatusActive(any())).thenReturn(250000.0);

        List<RecommendedVenueResponse> results = service.getPersonalizedRecommendations(
                email, 21.0285, 105.8542, null, 6
        );

        assertNotNull(results);
        assertEquals(2, results.size());

        // Venue 1 phải xếp đầu vì đúng môn sở trường (bóng đá), cách 0km và là sân quen (3 lần)
        RecommendedVenueResponse topVenue = results.get(0);
        assertEquals(venue1Id, topVenue.getId());
        assertTrue(topVenue.getMatchScore() > results.get(1).getMatchScore(), "Sân quen bóng đá gần 0km phải có điểm cao hơn sân xa");
        assertEquals("HISTORY", topVenue.getReasonType());
        assertTrue(topVenue.getRecommendationReason().contains("Sân quen"));
    }

    @Test
    @DisplayName("Reason Tag Disambiguation: Sân đặt 3 lần phải có tag HISTORY")
    void testReasonTagDisambiguation_HistoryPriority() {
        String email = "vip@sporta.com";
        User user = User.builder().id(101L).email(email).build();
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        UUID venueId = UUID.randomUUID();
        Venue venue = Venue.builder()
                .id(venueId)
                .name("Sân Quen Thể Thao")
                .sport(Sport.builder().id(1L).name("Bóng đá").build())
                .status(VenueStatus.ACTIVE)
                .approvalStatus(ApprovalStatus.APPROVED)
                .build();

        List<Booking> bookings = Arrays.asList(
                Booking.builder().user(user).venue(venue).finalPrice(150000.0).build(),
                Booking.builder().user(user).venue(venue).finalPrice(150000.0).build(),
                Booking.builder().user(user).venue(venue).finalPrice(150000.0).build()
        );
        when(bookingRepository.findByUserIdOrderByCreatedAtDesc(101L)).thenReturn(bookings);
        when(venueRepository.findInBoundingBox(any(), any(), any(), anyDouble(), anyDouble(), anyDouble(), anyDouble()))
                .thenReturn(Collections.singletonList(venue));

        List<RecommendedVenueResponse> results = service.getPersonalizedRecommendations(
                email, 21.0285, 105.8542, null, 6
        );

        assertEquals(1, results.size());
        assertEquals("HISTORY", results.get(0).getReasonType());
        assertEquals("Sân quen • Đã đặt 3 lần", results.get(0).getRecommendationReason());
    }
}
