package com.backend.sporta.util;

import com.backend.sporta.entity.CourtPriceRule;
import com.backend.sporta.enums.PriceRuleType;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Helper tính toán giá slot của sân dựa trên phân tầng CourtPriceRule:
 * 1. Giá gốc cơ sở: court.getPrice()
 * 2. Ưu tiên quy tắc theo ca (SHIFT rule) nếu slotTime nằm trong [startTime, endTime)
 * 3. Áp quy tắc theo thứ trong tuần (DAY_OF_WEEK modifier) lên giá hiện tại
 * 4. Làm tròn về bội số của 1.000 VNĐ
 */
public final class CourtPricingCalculationHelper {

    private CourtPricingCalculationHelper() {
        // Utility class
    }

    /**
     * Tính giá slot với đầu vào linh hoạt.
     *
     * @param baseCourtPrice  Giá cơ bản của sân (Court.price)
     * @param rules           Danh sách quy tắc giá của sân (CourtPriceRule)
     * @param dayOfWeekValue  Thứ trong tuần (1 = Thứ 2 ... 7 = Chủ Nhật theo ISO-8601)
     * @param slotTime        Thời gian bắt đầu của slot
     * @return Mức giá cuối cùng sau khi áp dụng rules và làm tròn 1.000 VNĐ
     */
    public static double calculateSlotPrice(
            Double baseCourtPrice,
            List<CourtPriceRule> rules,
            int dayOfWeekValue,
            LocalTime slotTime
    ) {
        double price = (baseCourtPrice != null) ? baseCourtPrice : 0.0;

        if (rules == null || rules.isEmpty()) {
            return Math.round(price / 1000.0) * 1000.0;
        }

        // 1. Áp SHIFT rule (giá tùy chỉnh theo ca giờ)
        if (slotTime != null) {
            for (CourtPriceRule rule : rules) {
                if (rule.getRuleType() == PriceRuleType.SHIFT
                        && rule.getStartTime() != null
                        && rule.getEndTime() != null
                        && rule.getCustomPrice() != null
                        && !slotTime.isBefore(rule.getStartTime())
                        && slotTime.isBefore(rule.getEndTime())) {
                    price = rule.getCustomPrice();
                    break;
                }
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

        // 3. Làm tròn giá về hàng nghìn (1.000 VNĐ)
        return Math.round(price / 1000.0) * 1000.0;
    }

    /**
     * Helper quá tải nhận LocalDate tiện lợi cho BookingService.
     */
    public static double calculateSlotPrice(
            Double baseCourtPrice,
            List<CourtPriceRule> rules,
            LocalDate bookingDate,
            LocalTime slotTime
    ) {
        int dayOfWeekValue = (bookingDate != null) ? bookingDate.getDayOfWeek().getValue() : 1;
        return calculateSlotPrice(baseCourtPrice, rules, dayOfWeekValue, slotTime);
    }
}
