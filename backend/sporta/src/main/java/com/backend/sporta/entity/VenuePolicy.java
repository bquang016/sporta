package com.backend.sporta.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "venue_policies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VenuePolicy {

    @Id
    @GeneratedValue
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "UUID")
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id", nullable = false)
    private Venue venue;

    @Column(name = "free_cancellation_hours")
    private Integer freeCancellationHours;

    @Column(name = "late_cancellation_refund_rate")
    private Integer lateCancellationRefundRate;

    @Column(name = "rain_reschedule_allowed")
    private Boolean rainRescheduleAllowed;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
