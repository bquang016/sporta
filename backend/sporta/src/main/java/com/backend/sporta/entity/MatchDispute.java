package com.backend.sporta.entity;

import com.backend.sporta.enums.MatchDisputeStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "match_disputes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchDispute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_room_id", nullable = false)
    private MatchRoom matchRoom;

    @Column(name = "deadline", nullable = false)
    private LocalDateTime deadline; // 12h countdown

    @Column(name = "team_a_evidence", columnDefinition = "TEXT")
    private String teamAEvidence;

    @Column(name = "team_b_evidence", columnDefinition = "TEXT")
    private String teamBEvidence;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MatchDisputeStatus status;

    @Column(name = "penalty_club_id")
    private Long penaltyClubId; // Đội bị phạt x2 Elo do cố tình báo sai

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
