package com.backend.sporta.util;

import com.backend.sporta.entity.CourtPriceRule;
import com.backend.sporta.enums.PriceRuleType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CourtPricingCalculationHelperRegressionTest {

    // Logic cũ nguyên bản của VenueService (dòng 284-326) để đối chứng
    private double legacyVenueServicePriceCalculation(
            Double baseCourtPrice,
            List<CourtPriceRule> rules,
            int dayOfWeekValue,
            LocalTime currentSlot
    ) {
        double price = (baseCourtPrice != null) ? baseCourtPrice : 0.0;

        // 1. Áp SHIFT rule (giá tùy chỉnh theo ca giờ)
        for (CourtPriceRule rule : rules) {
            if (rule.getRuleType() == PriceRuleType.SHIFT
                    && rule.getStartTime() != null
                    && rule.getEndTime() != null
                    && rule.getCustomPrice() != null
                    && !currentSlot.isBefore(rule.getStartTime())
                    && currentSlot.isBefore(rule.getEndTime())) {
                price = rule.getCustomPrice();
                break;
            }
        }

        // 2. Áp DAY_OF_WEEK modifier lên trên price hiện tại
        for (CourtPriceRule rule : rules) {
            if (rule.getRuleType() == PriceRuleType.DAY_OF_WEEK
                    && rule.getDayOfWeek() != null
                    && rule.getDayOfWeek() == dayOfWeekValue) {
                if (rule.getPercentageModifier() != null) {
                    price = price * rule.getPercentageModifier();
                }
                if (rule.getFixedModifier() != null) {
                    price = price + rule.getFixedModifier();
                }
                break;
            }
        }

        // Làm tròn giá về hàng nghìn
        price = Math.round(price / 1000.0) * 1000.0;
        return price;
    }

    @Test
    @DisplayName("Regression: Giá gốc cơ sở khi không có rules")
    void testBasePriceOnly() {
        double basePrice = 200000.0;
        List<CourtPriceRule> rules = Collections.emptyList();
        LocalTime slot = LocalTime.of(10, 0);
        int dow = 2; // Tuesday

        double expected = legacyVenueServicePriceCalculation(basePrice, rules, dow, slot);
        double actual = CourtPricingCalculationHelper.calculateSlotPrice(basePrice, rules, dow, slot);

        assertEquals(expected, actual);
        assertEquals(200000.0, actual);
    }

    @Test
    @DisplayName("Regression: Áp SHIFT rule khi trong ca")
    void testShiftRuleApplied() {
        double basePrice = 200000.0;
        List<CourtPriceRule> rules = new ArrayList<>();
        rules.add(CourtPriceRule.builder()
                .ruleType(PriceRuleType.SHIFT)
                .startTime(LocalTime.of(17, 0))
                .endTime(LocalTime.of(21, 0))
                .customPrice(250000.0)
                .build());

        LocalTime insideSlot = LocalTime.of(18, 0);
        int dow = 3; // Wednesday

        double expected = legacyVenueServicePriceCalculation(basePrice, rules, dow, insideSlot);
        double actual = CourtPricingCalculationHelper.calculateSlotPrice(basePrice, rules, dow, insideSlot);

        assertEquals(expected, actual);
        assertEquals(250000.0, actual);

        // Outside shift
        LocalTime outsideSlot = LocalTime.of(15, 0);
        double expectedOut = legacyVenueServicePriceCalculation(basePrice, rules, dow, outsideSlot);
        double actualOut = CourtPricingCalculationHelper.calculateSlotPrice(basePrice, rules, dow, outsideSlot);

        assertEquals(expectedOut, actualOut);
        assertEquals(200000.0, actualOut);
    }

    @Test
    @DisplayName("Regression: Áp DAY_OF_WEEK percentage modifier")
    void testDayOfWeekPercentageRule() {
        double basePrice = 200000.0;
        List<CourtPriceRule> rules = new ArrayList<>();
        rules.add(CourtPriceRule.builder()
                .ruleType(PriceRuleType.DAY_OF_WEEK)
                .dayOfWeek(6) // Saturday
                .percentageModifier(1.20) // +20%
                .build());

        LocalTime slot = LocalTime.of(10, 0);

        // Saturday (dow=6)
        double expectedSat = legacyVenueServicePriceCalculation(basePrice, rules, 6, slot);
        double actualSat = CourtPricingCalculationHelper.calculateSlotPrice(basePrice, rules, 6, slot);
        assertEquals(expectedSat, actualSat);
        assertEquals(240000.0, actualSat);

        // Friday (dow=5)
        double expectedFri = legacyVenueServicePriceCalculation(basePrice, rules, 5, slot);
        double actualFri = CourtPricingCalculationHelper.calculateSlotPrice(basePrice, rules, 5, slot);
        assertEquals(expectedFri, actualFri);
        assertEquals(200000.0, actualFri);
    }

    @Test
    @DisplayName("Regression: Áp DAY_OF_WEEK fixed modifier")
    void testDayOfWeekFixedRule() {
        double basePrice = 200000.0;
        List<CourtPriceRule> rules = new ArrayList<>();
        rules.add(CourtPriceRule.builder()
                .ruleType(PriceRuleType.DAY_OF_WEEK)
                .dayOfWeek(7) // Sunday
                .fixedModifier(30000.0) // +30k
                .build());

        LocalTime slot = LocalTime.of(10, 0);

        double expectedSun = legacyVenueServicePriceCalculation(basePrice, rules, 7, slot);
        double actualSun = CourtPricingCalculationHelper.calculateSlotPrice(basePrice, rules, 7, slot);
        assertEquals(expectedSun, actualSun);
        assertEquals(230000.0, actualSun);
    }

    @Test
    @DisplayName("Regression: Kết hợp cả SHIFT rule và DAY_OF_WEEK modifier")
    void testCombinedShiftAndDayRule() {
        double basePrice = 200000.0;
        List<CourtPriceRule> rules = new ArrayList<>();
        // SHIFT rule: 17:00 - 21:00 -> 250k
        rules.add(CourtPriceRule.builder()
                .ruleType(PriceRuleType.SHIFT)
                .startTime(LocalTime.of(17, 0))
                .endTime(LocalTime.of(21, 0))
                .customPrice(250000.0)
                .build());
        // DAY_OF_WEEK rule: Sunday -> +10%
        rules.add(CourtPriceRule.builder()
                .ruleType(PriceRuleType.DAY_OF_WEEK)
                .dayOfWeek(7)
                .percentageModifier(1.10)
                .build());

        LocalTime eveningSlot = LocalTime.of(19, 0);

        // Chủ nhật tối: 250k * 1.10 = 275k
        double expected = legacyVenueServicePriceCalculation(basePrice, rules, 7, eveningSlot);
        double actual = CourtPricingCalculationHelper.calculateSlotPrice(basePrice, rules, 7, eveningSlot);
        assertEquals(expected, actual);
        assertEquals(275000.0, actual);
    }

    @Test
    @DisplayName("Regression: Kiểm tra biên chính xác của ca giờ (exact start & end boundary)")
    void testExactTimeBoundary() {
        double basePrice = 200000.0;
        List<CourtPriceRule> rules = new ArrayList<>();
        rules.add(CourtPriceRule.builder()
                .ruleType(PriceRuleType.SHIFT)
                .startTime(LocalTime.of(17, 0))
                .endTime(LocalTime.of(21, 0))
                .customPrice(300000.0)
                .build());

        // At exact start time 17:00 (inside)
        double atStart = CourtPricingCalculationHelper.calculateSlotPrice(basePrice, rules, 1, LocalTime.of(17, 0));
        assertEquals(300000.0, atStart);

        // At exact end time 21:00 (outside)
        double atEnd = CourtPricingCalculationHelper.calculateSlotPrice(basePrice, rules, 1, LocalTime.of(21, 0));
        assertEquals(200000.0, atEnd);
    }

    @Test
    @DisplayName("Regression: Quá tải LocalDate tính chính xác")
    void testLocalDateOverload() {
        double basePrice = 200000.0;
        List<CourtPriceRule> rules = new ArrayList<>();
        rules.add(CourtPriceRule.builder()
                .ruleType(PriceRuleType.DAY_OF_WEEK)
                .dayOfWeek(6) // Saturday
                .percentageModifier(1.20)
                .build());

        LocalDate saturday = LocalDate.of(2026, 8, 29); // 2026-08-29 is Saturday (dow=6)
        double actual = CourtPricingCalculationHelper.calculateSlotPrice(basePrice, rules, saturday, LocalTime.of(10, 0));
        assertEquals(240000.0, actual);
    }
}
