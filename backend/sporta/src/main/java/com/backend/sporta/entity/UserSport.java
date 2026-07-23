package com.backend.sporta.entity;

import jakarta.persistence.*;
import lombok.*;
import com.backend.sporta.enums.SportLevel;

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

    @Column(name = "elo")
    @Builder.Default
    private Double elo = 1200.0;

    @Column(name = "matches_played")
    @Builder.Default
    private Integer matchesPlayed = 0;
}
