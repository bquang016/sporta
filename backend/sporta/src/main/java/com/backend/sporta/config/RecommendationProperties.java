package com.backend.sporta.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "sporta.recommendation")
@Getter
@Setter
public class RecommendationProperties {

    private Weights weights = new Weights();
    private Parameters parameters = new Parameters();

    @Getter
    @Setter
    public static class Weights {
        private Double sport = 0.35;
        private Double distance = 0.25;
        private Double price = 0.15;
        private Double popularity = 0.15;
        private Double history = 0.10;
    }

    @Getter
    @Setter
    public static class Parameters {
        private Double sigmaKm = 3.5;
        private Double initialRadiusKm = 15.0;
        private Double expandedRadiusKm = 30.0;
        private Integer coldStartThreshold = 3;
        private Double defaultPriceRange = 250000.0;
    }
}
