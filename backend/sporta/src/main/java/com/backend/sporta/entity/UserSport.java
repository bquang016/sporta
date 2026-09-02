package com.backend.sporta.entity;

import jakarta.persistence.*;
import lombok.*;
import com.backend.sporta.enums.EloStatus;
import com.backend.sporta.enums.SportLevel;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_sports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sport_id", nullable = false)
    private Sport sport;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SportLevel level;

    @Column(name = "elo_rating")
    @Builder.Default
    private Integer eloRating = null;

    @Enumerated(EnumType.STRING)
    @Column(name = "elo_status", nullable = false)
    @Builder.Default
    private EloStatus eloStatus = EloStatus.UNVERIFIED;

    @Column(name = "placement_matches_played", nullable = false)
    @Builder.Default
    private Integer placementMatchesPlayed = 0;

    @Column(name = "total_ranked_matches", nullable = false)
    @Builder.Default
    private Integer totalRankedMatches = 0;

    @Column(name = "total_wins", nullable = false)
    @Builder.Default
    private Integer totalWins = 0;

    @Column(name = "last_match_at")
    private LocalDateTime lastMatchAt;

    public int getEffectiveElo() {
        if (this.eloRating != null) {
            return this.eloRating;
        }
        return mapSeedElo(this.level);
    }

    public static int mapSeedElo(SportLevel level) {
        if (level == null) return 1000;
        switch (level) {
            case WEAK:
                return 900;
            case WEAK_AVERAGE:
                return 1200;
            case AVERAGE:
                return 1500;
            case AVERAGE_GOOD:
                return 1800;
            case GOOD:
                return 2100;
            default:
                return 1000;
        }
    }
}

