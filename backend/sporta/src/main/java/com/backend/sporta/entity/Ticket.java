package com.backend.sporta.entity;

import com.backend.sporta.enums.TicketStatus;
import jakarta.persistence.*;
import lombok.*;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    @GeneratedValue
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "UUID")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private TicketSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private TicketStatus status = TicketStatus.UNUSED;

    @Column(name = "qr_code_token", columnDefinition = "TEXT")
    private String qrCodeToken;

    @Column(name = "short_code", length = 6, unique = true)
    private String shortCode;

    @Column(name = "quantity")
    @Builder.Default
    private Integer quantity = 1;

    @Enumerated(EnumType.STRING)
    @Column(name = "team")
    private com.backend.sporta.enums.TeamSide team;

    @Column(name = "is_captain", nullable = false)
    @Builder.Default
    private Boolean isCaptain = false;

    @Column(name = "is_score_confirmed", nullable = false)
    @Builder.Default
    private Boolean isScoreConfirmed = false;

    public int getQuantity() {
        return this.quantity != null ? this.quantity : 1;
    }

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    private static final String SHORT_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.shortCode == null) {
            this.shortCode = generateShortCode();
        }
    }

    public static String generateShortCode() {
        StringBuilder sb = new StringBuilder(6);
        for (int i = 0; i < 6; i++) {
            sb.append(SHORT_CODE_CHARS.charAt(RANDOM.nextInt(SHORT_CODE_CHARS.length())));
        }
        return sb.toString();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
