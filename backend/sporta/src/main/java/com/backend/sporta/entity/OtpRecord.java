package com.backend.sporta.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "otp_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(name = "otp_code", nullable = false)
    private String otpCode;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "attempt_count", nullable = false)
    private Integer attemptCount;

    @Column(name = "last_sent_at", nullable = false)
    private LocalDateTime lastSentAt;
}
