package com.backend.sporta.entity;

import com.backend.sporta.enums.MatchStatus;
import com.backend.sporta.enums.MatchType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "matches", indexes = {
    @Index(name = "idx_match_host_club", columnList = "host_club_id"),
    @Index(name = "idx_match_guest_club", columnList = "guest_club_id"),
    @Index(name = "idx_match_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Match {

    @Id
    @GeneratedValue
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "UUID")
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private MatchRoom room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_club_id", nullable = false)
    private Club hostClub;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_club_id", nullable = false)
    private Club guestClub;

    @Enumerated(EnumType.STRING)
    @Column(name = "match_type", nullable = false)
    private MatchType matchType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private MatchStatus status = MatchStatus.MATCHED;

    @Column(name = "host_share_percent")
    private Integer hostSharePercent;

    @Column(name = "guest_share_percent")
    private Integer guestSharePercent;

    @Column(name = "guest_share_amount")
    private Double guestShareAmount;

    // Rating Snapshot at match confirmation time
    @Column(name = "host_club_elo_snapshot")
    private Integer hostClubEloSnapshot;

    @Column(name = "guest_club_elo_snapshot")
    private Integer guestClubEloSnapshot;

    @Column(name = "host_level_snapshot")
    private String hostLevelSnapshot;

    @Column(name = "guest_level_snapshot")
    private String guestLevelSnapshot;

    @Column(name = "host_crp_before_snapshot")
    private Integer hostCrpBeforeSnapshot;

    @Column(name = "guest_crp_before_snapshot")
    private Integer guestCrpBeforeSnapshot;

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
