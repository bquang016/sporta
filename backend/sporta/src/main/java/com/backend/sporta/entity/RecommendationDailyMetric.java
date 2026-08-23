package com.backend.sporta.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "recommendation_daily_metrics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecommendationDailyMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "report_date", nullable = false, unique = true)
    private LocalDate reportDate;

    @Column(name = "total_impressions", nullable = false)
    @Builder.Default
    private Long totalImpressions = 0L;

    @Column(name = "total_clicks", nullable = false)
    @Builder.Default
    private Long totalClicks = 0L;

    @Column(name = "total_bookings", nullable = false)
    @Builder.Default
    private Long totalBookings = 0L;

    @Column(name = "ctr", nullable = false)
    @Builder.Default
    private Double ctr = 0.0;

    @Column(name = "precision_at_3", nullable = false)
    @Builder.Default
    private Double precisionAt3 = 0.0;

    @Column(name = "precision_at_6", nullable = false)
    @Builder.Default
    private Double precisionAt6 = 0.0;

    @Column(name = "calculated_at", nullable = false)
    private LocalDateTime calculatedAt;

    @PrePersist
    @PreUpdate
    protected void onSave() {
        this.calculatedAt = LocalDateTime.now();
    }
}
