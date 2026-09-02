package com.backend.sporta.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "poll_votes",
       uniqueConstraints = @UniqueConstraint(name = "uq_poll_user_vote", columnNames = {"poll_id", "user_id"}),
       indexes = {
           @Index(name = "idx_poll_votes_poll", columnList = "poll_id"),
           @Index(name = "idx_poll_votes_user", columnList = "user_id")
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PollVote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poll_id", nullable = false)
    private MatchPoll poll;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "option_id", nullable = false)
    private PollOption option;

    @Column(name = "voted_at")
    private LocalDateTime votedAt;

    @PrePersist
    protected void onCreate() {
        if (this.votedAt == null) {
            this.votedAt = LocalDateTime.now();
        }
    }
}
