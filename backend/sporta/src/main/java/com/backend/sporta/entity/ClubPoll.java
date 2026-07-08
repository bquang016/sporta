package com.backend.sporta.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "club_polls")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubPoll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(name = "close_time", nullable = false)
    private String closeTime; // Store as "HH:mm" e.g. "15:00"

    @Column(name = "is_closed", nullable = false)
    @Builder.Default
    private Boolean isClosed = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @Column(name = "matchmade_teams", columnDefinition = "TEXT")
    private String matchmadeTeams; // JSON format: {"teamA":["Name1"],"teamB":["Name2"]}

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
