package com.backend.sporta.entity;

import com.backend.sporta.enums.SportLevel;
import com.backend.sporta.enums.TicketSessionStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "ticket_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketSession {

    @Id
    @GeneratedValue
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "UUID")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id", nullable = false)
    private Venue venue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "court_id", nullable = false)
    private Court court;

    @Column(name = "play_date", nullable = false)
    private LocalDate playDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "price_per_ticket", nullable = false)
    private BigDecimal pricePerTicket;

    @Column(name = "max_slots", nullable = false)
    private Integer maxSlots;

    @Column(name = "booked_slots", nullable = false)
    @Builder.Default
    private Integer bookedSlots = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "sport_level", nullable = false)
    private SportLevel sportLevel;

    @Column(name = "has_host_team", nullable = false)
    @Builder.Default
    private Boolean hasHostTeam = false;

    @Column(name = "host_team_name")
    private String hostTeamName;

    @Enumerated(EnumType.STRING)
    @Column(name = "host_team_level")
    private SportLevel hostTeamLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private TicketSessionStatus status = TicketSessionStatus.OPEN;

    @Column(name = "host_score")
    private String hostScore;

    @Column(name = "guest_score")
    private String guestScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "match_outcome")
    private com.backend.sporta.enums.NormalizedOutcome matchOutcome;

    @Column(name = "is_elo_settled", nullable = false)
    @Builder.Default
    private Boolean isEloSettled = false;

    @Column(name = "score_declared_at")
    private LocalDateTime scoreDeclaredAt;

    @Column(name = "score_confirmed_count", nullable = false)
    @Builder.Default
    private Integer scoreConfirmedCount = 0;

    @Column(name = "is_disputed", nullable = false)
    @Builder.Default
    private Boolean isDisputed = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.bookedSlots == null) {
            this.bookedSlots = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
