package com.backend.sporta.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "match_polls")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchPoll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_room_id", nullable = false)
    private MatchRoom matchRoom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;

    @Column(name = "required_votes", nullable = false)
    private Integer requiredVotes;

    @Column(name = "current_yes_votes", nullable = false)
    @Builder.Default
    private Integer currentYesVotes = 0;

    @Column(name = "is_unlocked", nullable = false)
    @Builder.Default
    private Boolean isUnlocked = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
