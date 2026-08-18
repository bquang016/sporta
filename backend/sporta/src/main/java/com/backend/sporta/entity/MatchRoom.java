package com.backend.sporta.entity;

import com.backend.sporta.enums.MatchStatus;
import com.backend.sporta.enums.MatchType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "match_rooms", indexes = {
    @Index(name = "idx_match_room_booking", columnList = "booking_id"),
    @Index(name = "idx_match_room_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchRoom {

    @Id
    @GeneratedValue
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "UUID")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_club_id", nullable = false)
    private Club hostClub;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_club_id")
    private Club guestClub;

    @Enumerated(EnumType.STRING)
    @Column(name = "match_type", nullable = false)
    private MatchType matchType;

    @Column(name = "host_share_percent", nullable = false)
    private Integer hostSharePercent;

    @Column(name = "guest_share_percent", nullable = false)
    private Integer guestSharePercent;

    @Column(name = "guest_share_amount", nullable = false)
    private Double guestShareAmount;

    @Column(name = "desired_levels")
    private String desiredLevels;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private MatchStatus status = MatchStatus.OPEN;

    @Column(name = "join_deadline", nullable = false)
    private LocalDateTime joinDeadline;

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
