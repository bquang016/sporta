package com.backend.sporta.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "recommendation_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecommendationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "user_email")
    private String userEmail;

    @Column(name = "venue_id", nullable = false)
    private UUID venueId;

    @Column(name = "match_score", nullable = false)
    private Integer matchScore;

    @Column(name = "reason_type")
    private String reasonType;

    @Column(name = "reason_tag")
    private String reasonTag;

    @Column(name = "position_index")
    private Integer positionIndex;

    @Column(name = "clicked", nullable = false)
    @Builder.Default
    private Boolean clicked = false;

    @Column(name = "booked", nullable = false)
    @Builder.Default
    private Boolean booked = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}
