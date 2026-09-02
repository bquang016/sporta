package com.backend.sporta.entity;

import com.backend.sporta.enums.LineupStatus;
import com.backend.sporta.enums.LineupType;
import com.backend.sporta.enums.TeamSide;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "match_lineups", indexes = {
    @Index(name = "idx_match_lineups_club", columnList = "club_id"),
    @Index(name = "idx_match_lineups_room", columnList = "match_room_id"),
    @Index(name = "idx_match_lineups_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchLineup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poll_id")
    private MatchPoll sourcePoll;

    @Column(nullable = false)
    private String name;

    @Column(name = "elo_avg")
    @Builder.Default
    private Integer eloAvg = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "lineup_type", nullable = false)
    private LineupType lineupType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private LineupStatus status = LineupStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_room_id")
    private MatchRoom matchRoom;

    @Enumerated(EnumType.STRING)
    @Column(name = "team_side")
    private TeamSide teamSide;

    @OneToMany(mappedBy = "lineup", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<LineupMember> members = new ArrayList<>();

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
