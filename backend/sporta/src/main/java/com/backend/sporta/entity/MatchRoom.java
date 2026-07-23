package com.backend.sporta.entity;

import com.backend.sporta.enums.MatchFlowType;
import com.backend.sporta.enums.MatchRoomStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "match_rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_club_id", nullable = false)
    private Club creatorClub;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_user_id", nullable = false)
    private User creatorUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "matched_club_id")
    private Club matchedClub;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sport_id", nullable = false)
    private Sport sport;

    @Column(nullable = false)
    private String format; // 5v5, 7v7, etc.

    @Column(name = "min_elo")
    private Integer minElo;

    @Column(name = "max_elo")
    private Integer maxElo;

    private String area;

    private Double latitude;

    private Double longitude;

    @Column(name = "expected_start_time", nullable = false)
    private LocalDateTime expectedStartTime;

    @Column(name = "expected_end_time")
    private LocalDateTime expectedEndTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "court_id")
    private Court court;

    @Column(name = "price_share_per_team")
    private BigDecimal priceSharePerTeam;

    @Enumerated(EnumType.STRING)
    @Column(name = "flow_type", nullable = false)
    private MatchFlowType flowType;

    @Column(name = "deposit_amount")
    private BigDecimal depositAmount;

    @Column(name = "ttl_expires_at")
    private LocalDateTime ttlExpiresAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MatchRoomStatus status;

    @Column(name = "allow_different_level")
    @Builder.Default
    private Boolean allowDifferentLevel = false;

    @Column(columnDefinition = "TEXT")
    private String message;

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
