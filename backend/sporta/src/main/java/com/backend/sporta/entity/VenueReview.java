package com.backend.sporta.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "venue_reviews",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_venue_review_user", columnNames = {"venue_id", "user_id"})
    },
    indexes = {
        @Index(name = "idx_venue_review_venue", columnList = "venue_id"),
        @Index(name = "idx_venue_review_user",  columnList = "user_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VenueReview {

    @Id
    @GeneratedValue
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "UUID")
    private UUID id;

    /** Sân được đánh giá */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id", nullable = false)
    private Venue venue;

    /** Người đánh giá */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Điểm tổng thể 1–5 */
    @Column(name = "rating", nullable = false)
    private Integer rating;

    /** Nhận xét văn bản (tùy chọn, max 1000 ký tự) */
    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    /** Phản hồi của chủ sân (tùy chọn, chỉ được reply 1 lần) */
    @Column(name = "owner_reply", columnDefinition = "TEXT")
    private String ownerReply;

    @Column(name = "owner_replied_at")
    private LocalDateTime ownerRepliedAt;

    /** Soft-delete: ẩn review vi phạm */
    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private Boolean isDeleted = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.isDeleted == null) this.isDeleted = false;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
