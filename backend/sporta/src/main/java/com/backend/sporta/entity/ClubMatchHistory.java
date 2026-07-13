package com.backend.sporta.entity;

import com.backend.sporta.enums.MatchResult;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "club_match_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubMatchHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "opponent_name", nullable = false)
    private String opponentName;

    @Column(name = "opponent_avatar")
    private String opponentAvatar;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "our_score", nullable = false)
    private Integer ourScore;

    @Column(name = "opponent_score", nullable = false)
    private Integer opponentScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MatchResult result;

    @Column(name = "location")
    private String location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
