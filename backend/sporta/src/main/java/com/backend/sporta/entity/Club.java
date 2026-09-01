package com.backend.sporta.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "clubs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Club {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "avatar_image")
    private String avatarImage;

    @Column(name = "cover_image")
    private String coverImage;

    @Column(name = "is_private", nullable = false)
    @Builder.Default
    private Boolean isPrivate = false;

    @Column(name = "activity_level")
    private String activityLevel;

    @Column(name = "area")
    private String area;

    @Column(name = "max_members")
    @Builder.Default
    private Integer maxMembers = 50;

    @Column(name = "elo")
    @Builder.Default
    private Integer elo = 1000;

    @Column(name = "min_elo_required")
    @Builder.Default
    private Integer minEloRequired = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "recruitment_status", nullable = false)
    @Builder.Default
    private com.backend.sporta.enums.RecruitmentStatus recruitmentStatus = com.backend.sporta.enums.RecruitmentStatus.OPEN;

    @Column(name = "crp")
    @Builder.Default
    private Integer crp = 0;

    @Column(name = "ranked_wins")
    @Builder.Default
    private Integer rankedWins = 0;

    @Column(name = "final_matches")
    @Builder.Default
    private Integer finalMatches = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sport_id", nullable = false)
    private Sport sport;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

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
