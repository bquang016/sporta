package com.backend.sporta.entity;

import com.backend.sporta.enums.NormalizedOutcome;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "score_submissions", indexes = {
    @Index(name = "idx_score_submission_match", columnList = "match_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScoreSubmission {

    @Id
    @GeneratedValue
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "UUID")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_by_club_id", nullable = false)
    private Club submittedByClub;

    @Column(name = "version", nullable = false)
    @Builder.Default
    private Integer version = 1;

    @Column(name = "host_score", nullable = false)
    private String hostScore;

    @Column(name = "guest_score", nullable = false)
    private String guestScore;

    @Column(name = "raw_score_details")
    private String rawScoreDetails;

    @Enumerated(EnumType.STRING)
    @Column(name = "outcome", nullable = false)
    private NormalizedOutcome outcome;

    @Column(name = "g_factor", nullable = false)
    private Double gFactor;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @PrePersist
    protected void onCreate() {
        this.submittedAt = LocalDateTime.now();
    }
}
