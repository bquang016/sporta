package com.backend.sporta.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "crp_ledger", uniqueConstraints = {
    @UniqueConstraint(name = "uk_crp_ledger_match_club", columnNames = {"match_id", "club_id"})
}, indexes = {
    @Index(name = "idx_crp_ledger_club", columnList = "club_id"),
    @Index(name = "idx_crp_ledger_match", columnList = "match_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CRPLedger {

    @Id
    @GeneratedValue
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "UUID")
    private UUID id;

    @Column(name = "match_id", nullable = false, columnDefinition = "UUID")
    private UUID matchId;

    @Column(name = "club_id", nullable = false)
    private Long clubId;

    @Column(name = "before_crp", nullable = false)
    private Integer beforeCrp;

    @Column(name = "delta_crp", nullable = false)
    private Integer deltaCrp;

    @Column(name = "after_crp", nullable = false)
    private Integer afterCrp;

    @Column(name = "reason", nullable = false)
    private String reason;

    @Column(name = "algorithm_version", nullable = false)
    private String algorithmVersion;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
