package com.backend.sporta.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "poll_options", indexes = {
    @Index(name = "idx_poll_options_poll", columnList = "poll_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PollOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poll_id", nullable = false)
    private MatchPoll poll;

    @Column(nullable = false)
    private String label;

    @Column(name = "is_join_option", nullable = false)
    @Builder.Default
    private Boolean isJoinOption = false;

    @Column(name = "is_default", nullable = false)
    @Builder.Default
    private Boolean isDefault = true;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;
}
