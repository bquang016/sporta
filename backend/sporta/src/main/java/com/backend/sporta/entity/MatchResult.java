package com.backend.sporta.entity;

import com.backend.sporta.enums.NormalizedOutcome;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "match_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchResult {

    @Id
    @GeneratedValue
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "UUID")
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id", nullable = false, unique = true)
    private Match match;

    @Enumerated(EnumType.STRING)
    @Column(name = "outcome", nullable = false)
    private NormalizedOutcome outcome;

    @Column(name = "final_score_text", nullable = false)
    private String finalScoreText;

    @Column(name = "host_crp_before", nullable = false)
    private Integer hostCrpBefore;

    @Column(name = "host_crp_delta", nullable = false)
    private Integer hostCrpDelta;

    @Column(name = "host_crp_after", nullable = false)
    private Integer hostCrpAfter;

    @Column(name = "guest_crp_before", nullable = false)
    private Integer guestCrpBefore;

    @Column(name = "guest_crp_delta", nullable = false)
    private Integer guestCrpDelta;

    @Column(name = "guest_crp_after", nullable = false)
    private Integer guestCrpAfter;

    @Column(name = "is_ranked_eligible", nullable = false)
    @Builder.Default
    private Boolean isRankedEligible = true;

    @Column(name = "explanation_json", columnDefinition = "TEXT")
    private String explanationJson;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @PrePersist
    protected void onCreate() {
        this.confirmedAt = LocalDateTime.now();
    }
}
