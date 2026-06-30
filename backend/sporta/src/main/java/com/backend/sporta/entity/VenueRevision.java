package com.backend.sporta.entity;

import com.backend.sporta.enums.ApprovalStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "venue_revisions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VenueRevision {

    @Id
    @GeneratedValue
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "UUID")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id", nullable = false)
    private Venue venue;

    // Lưu chuỗi JSON chứa các dữ liệu bị thay đổi (VD: {"name": "Sân mới", "location": "Địa chỉ mới"})
    @Column(name = "pending_data", columnDefinition = "TEXT", nullable = false)
    private String pendingData;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ApprovalStatus status = ApprovalStatus.PENDING;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "reviewer_notes", columnDefinition = "TEXT")
    private String reviewerNotes;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}