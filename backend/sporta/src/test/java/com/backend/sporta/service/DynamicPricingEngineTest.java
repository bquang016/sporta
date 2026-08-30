package com.backend.sporta.service;

import com.backend.sporta.config.DynamicPricingProperties;
import com.backend.sporta.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@ExtendWith(MockitoExtension.class)
class DynamicPricingEngineTest {

    @Mock
    private CourtRepository courtRepository;
    @Mock
    private VenueRepository venueRepository;
    @Mock
    private BookingDetailRepository bookingDetailRepository;
    @Mock
    private CourtPriceRuleRepository courtPriceRuleRepository;
    @Mock
    private DemandForecastMetricRepository demandForecastMetricRepository;
    @Mock
    private PricingRecommendationRepository pricingRecommendationRepository;
    @Mock
    private PricingActionLogRepository pricingActionLogRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private OwnerRepository ownerRepository;

    @Spy
    private DynamicPricingProperties properties = new DynamicPricingProperties();

    @InjectMocks
    private DynamicPricingServiceImpl dynamicPricingService;

    @BeforeEach
    void setUp() {
        // Properties defaults match the approved plan
    }

    @Test
    @DisplayName("Kịch bản 1: Giờ vàng cuối tuần (T7 18:00, OR=1.0, Base 300k) -> Kẹp biên đúng trần +20% (360k VNĐ)")
    void testPeakHourClampedAtMax() {
        double basePrice = 300000.0;
        int dayOfWeek = 6; // Saturday
        LocalTime slotTime = LocalTime.of(18, 0);
        double occupancyRate = 1.0; // 100% booked

        double dayFactor = dynamicPricingService.calculateDayFactor(dayOfWeek);
        double slotFactor = dynamicPricingService.calculateTimeSlotFactor(dayOfWeek, slotTime);
        double occupancyFactor = dynamicPricingService.calculateOccupancyFactor(occupancyRate);

        assertEquals(1.08, dayFactor, 0.001);
        assertEquals(1.10, slotFactor, 0.001);
        assertEquals(1.20, occupancyFactor, 0.001);

        double rawPrice = basePrice * dayFactor * slotFactor * occupancyFactor;
        assertEquals(427680.0, rawPrice, 0.001);

        double finalPrice = dynamicPricingService.calculateFinalSuggestedPrice(basePrice, dayFactor, slotFactor, occupancyFactor);

        // Trần +20% của 300k = 360k
        assertEquals(360000.0, finalPrice, "Giá trần phải là 360k VNĐ (+20%)");
    }

    @Test
    @DisplayName("Kịch bản 2: Thấp điểm ngày thường (T3 09:00, OR=0.0, Base 120k) -> Inward Rounding lên 100k VNĐ (Không phá vỡ sàn -20%)")
    void testOffPeakInwardRounding() {
        double basePrice = 120000.0;
        int dayOfWeek = 2; // Tuesday
        LocalTime slotTime = LocalTime.of(9, 0);
        double occupancyRate = 0.0; // 0% booked

        double dayFactor = dynamicPricingService.calculateDayFactor(dayOfWeek);
        double slotFactor = dynamicPricingService.calculateTimeSlotFactor(dayOfWeek, slotTime);
        double occupancyFactor = dynamicPricingService.calculateOccupancyFactor(occupancyRate);

        assertEquals(0.96, dayFactor, 0.001);
        assertEquals(0.92, slotFactor, 0.001);
        assertEquals(0.85, occupancyFactor, 0.001);

        double rawPrice = basePrice * dayFactor * slotFactor * occupancyFactor;
        assertEquals(90086.4, rawPrice, 0.1);

        double finalPrice = dynamicPricingService.calculateFinalSuggestedPrice(basePrice, dayFactor, slotFactor, occupancyFactor);

        // Floor = 120k * 0.80 = 96k
        // Standard rounding 96k / 5k = 95k (< 96k -> Inward rounding lên 100k)
        assertEquals(100000.0, finalPrice, "Giá sàn sau Inward Rounding phải là 100k VNĐ");
        assertTrue(finalPrice >= basePrice * 0.80, "Giá cuối cùng tuyệt đối không được nhỏ hơn sàn -20% (96k)");
        assertTrue(finalPrice <= basePrice * 1.20, "Giá cuối cùng không được vượt trần +20%");
    }

    @Test
    @DisplayName("Kịch bản 3: Giữa trưa cuối tuần (T7 12:00, OR=0.50, Base 150k) -> F_slot = 1.00 toàn miền không bị thủng")
    void testWeekendMiddayFullDomain() {
        double basePrice = 150000.0;
        int dayOfWeek = 6; // Saturday
        LocalTime slotTime = LocalTime.of(12, 0); // 12:00 PM
        double occupancyRate = 0.50; // In deadband [0.40, 0.70]

        double dayFactor = dynamicPricingService.calculateDayFactor(dayOfWeek);
        double slotFactor = dynamicPricingService.calculateTimeSlotFactor(dayOfWeek, slotTime);
        double occupancyFactor = dynamicPricingService.calculateOccupancyFactor(occupancyRate);

        assertEquals(1.08, dayFactor, 0.001);
        assertEquals(1.00, slotFactor, 0.001, "F_slot trưa cuối tuần phải là 1.00 (không bị rỗng)");
        assertEquals(1.00, occupancyFactor, 0.001, "F_occ trong deadband [0.40, 0.70] phải là 1.00");

        double finalPrice = dynamicPricingService.calculateFinalSuggestedPrice(basePrice, dayFactor, slotFactor, occupancyFactor);

        // Raw = 150k * 1.08 * 1.00 * 1.00 = 162k -> Rounded to 160k
        assertEquals(160000.0, finalPrice);
    }

    @Test
    @DisplayName("Deadband cân bằng: OR = 0.55 -> F_occ = 1.00 giữ nguyên giá gốc ngày thường")
    void testDeadbandOccupancy() {
        double fOcc = dynamicPricingService.calculateOccupancyFactor(0.55);
        assertEquals(1.00, fOcc);

        double fOccMin = dynamicPricingService.calculateOccupancyFactor(0.40);
        assertEquals(1.00, fOccMin);

        double fOccMax = dynamicPricingService.calculateOccupancyFactor(0.70);
        assertEquals(1.00, fOccMax);
    }

    @Test
    @DisplayName("Làm tròn bước giá an toàn 5.000 VNĐ")
    void testRoundingStep() {
        double basePrice = 175000.0;
        double dayFactor = 1.02; // Friday
        double slotFactor = 1.00;
        double occupancyFactor = 1.00;

        // Raw = 175000 * 1.02 = 178500 -> Rounded step 5000 -> 180000
        double finalPrice = dynamicPricingService.calculateFinalSuggestedPrice(basePrice, dayFactor, slotFactor, occupancyFactor);
        assertEquals(180000.0, finalPrice);
    }
}
