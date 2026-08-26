package com.backend.sporta.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "demand_forecast_metrics", indexes = {
        @Index(name = "idx_dfm_court_dow_time", columnList = "court_id, day_of_week, start_time")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemandForecastMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "court_id", nullable = false)
    private Court court;

    @Column(name = "day_of_week", nullable = false)
    private Integer dayOfWeek; // 1 = Monday ... 7 = Sunday (ISO-8601)

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "occupancy_rate", nullable = false)
    private Double occupancyRate;

    @Column(name = "active_weeks_evaluated", nullable = false)
    private Integer activeWeeksEvaluated;

    @Column(name = "booked_slots_count", nullable = false)
    private Integer bookedSlotsCount;

    @Column(name = "calculated_at", nullable = false)
    private LocalDateTime calculatedAt;

    @PrePersist
    protected void onCreate() {
        if (this.calculatedAt == null) {
            this.calculatedAt = LocalDateTime.now();
        }
    }
}
