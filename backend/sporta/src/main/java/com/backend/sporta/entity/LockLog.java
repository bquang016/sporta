package com.backend.sporta.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "lock_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LockLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "admin_id", nullable = false)
    private Long adminId;

    @Column(name = "action", nullable = false)
    private String action; // "LOCK" or "UNLOCK"

    @Column(name = "reason_category")
    private String reasonCategory;

    @Column(name = "reason_detail", length = 1000)
    private String reasonDetail;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
