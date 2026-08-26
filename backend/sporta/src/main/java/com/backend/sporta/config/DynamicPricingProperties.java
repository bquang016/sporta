package com.backend.sporta.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
@ConfigurationProperties(prefix = "sporta.dynamic-pricing")
@Getter
@Setter
public class DynamicPricingProperties {

    private Window window = new Window();
    private OccupancyThresholds occupancyThresholds = new OccupancyThresholds();
    private OccupancyFactors occupancyFactors = new OccupancyFactors();
    private DayFactors dayFactors = new DayFactors();
    private SlotFactors slotFactors = new SlotFactors();
    private GlobalEnvelope envelope = new GlobalEnvelope();
    private Constraints constraints = new Constraints();
    private Scheduler scheduler = new Scheduler();
    private Map<String, Double> defaultSportBenchmarks = new HashMap<>();

    public DynamicPricingProperties() {
        // Mặc định benchmark môn thể thao nếu chưa cấu hình trong application.properties
        defaultSportBenchmarks.put("BADMINTON", 0.55);
        defaultSportBenchmarks.put("FOOTBALL", 0.60);
        defaultSportBenchmarks.put("PICKLEBALL", 0.65);
        defaultSportBenchmarks.put("TENNIS", 0.50);
        defaultSportBenchmarks.put("BASKETBALL", 0.50);
        defaultSportBenchmarks.put("DEFAULT", 0.55);
    }

    @Getter
    @Setter
    public static class Window {
        private Integer evaluationWeeks = 6;
        private Integer coldStartMinWeeks = 4;
    }

    @Getter
    @Setter
    public static class OccupancyThresholds {
        private Double deadbandMin = 0.40;
        private Double deadbandMax = 0.70;
    }

    @Getter
    @Setter
    public static class OccupancyFactors {
        /** Mức tăng giá tối đa nội tại do F_occ (mặc định +20%) */
        private Double maxSurgePercentage = 0.20;
        /** Mức giảm giá tối đa nội tại do F_occ (mặc định -15%) */
        private Double maxDiscountPercentage = 0.15;
    }

    @Getter
    @Setter
    public static class DayFactors {
        private Double weekday = 0.96;
        private Double friday = 1.02;
        private Double weekend = 1.08;
    }

    @Getter
    @Setter
    public static class SlotFactors {
        private Double weekdayLowPeak = 0.92;
        private Double weekdayGoldenPeak = 1.10;
        private Double weekendGoldenPeak = 1.10;
        private Double standard = 1.00;
    }

    @Getter
    @Setter
    public static class GlobalEnvelope {
        /** Giới hạn tăng giá tối đa toàn cục sau khi nhân toàn bộ factor (mặc định +20%) */
        private Double maxIncreasePercentage = 0.20;
        /** Giới hạn giảm giá tối đa toàn cục sau khi nhân toàn bộ factor (mặc định -20%) */
        private Double maxDecreasePercentage = 0.20;
    }

    @Getter
    @Setter
    public static class Constraints {
        private Double absoluteMinPrice = 50000.0;
        private Double absoluteMaxPrice = 2000000.0;
        private Double roundingStep = 5000.0;
    }

    @Getter
    @Setter
    public static class Scheduler {
        private String cronExpression = "0 0 3 * * *"; // 03:00 AM mỗi ngày
        private Integer recommendationTtlHours = 48;
    }
}
