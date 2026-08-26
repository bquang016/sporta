package com.backend.sporta.entity;

import com.backend.sporta.enums.PricingActionType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "pricing_action_logs", indexes = {
        @Index(name = "idx_pal_court_id", columnList = "court_id"),
        @Index(name = "idx_pal_action_timestamp", columnList = "action_timestamp")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PricingActionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "recommendation_id")
    private UUID recommendationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "court_id", nullable = false)
    private Court court;

    @Column(name = "owner_id")
    private Long ownerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false)
    private PricingActionType actionType; // APPLY, REJECT, CUSTOMIZE

    @Column(name = "original_price", nullable = false)
    private Double originalPrice;

    @Column(name = "suggested_price", nullable = false)
    private Double suggestedPrice;

    @Column(name = "applied_price")
    private Double appliedPrice;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "action_timestamp", nullable = false)
    private LocalDateTime actionTimestamp;

    @PrePersist
    protected void onCreate() {
        if (this.actionTimestamp == null) {
            this.actionTimestamp = LocalDateTime.now();
        }
    }
}
