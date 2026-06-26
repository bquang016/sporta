package com.backend.sporta.entity;

import com.backend.sporta.enums.RegistrationStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "owner_registrations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnerRegistration {

    @Id
    @GeneratedValue
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "UUID")
    private UUID id;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "id_number")
    private String idNumber;

    @Column(name = "id_front_image", columnDefinition = "TEXT")
    private String idFrontImage;

    @Column(name = "id_back_image", columnDefinition = "TEXT")
    private String idBackImage;

    // ── Venue info ──
    @Column(name = "venue_name", nullable = false)
    private String venueName;

    @Column(name = "province")
    private String province;

    @Column(name = "district")
    private String district;

    @Column(name = "ward")
    private String ward;

    @Column(name = "sport_types", columnDefinition = "TEXT")
    private String sportTypes;

    @Column(name = "sub_court_count")
    private int subCourtCount;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "registration_images", columnDefinition = "TEXT")
    private String registrationImages;

    // ── Detail data as JSON ──
    @Column(name = "amenities_json", columnDefinition = "TEXT")
    private String amenitiesJson;

    @Column(name = "courts_json", columnDefinition = "TEXT")
    private String courtsJson;

    // ── Status ──
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "VARCHAR(50) DEFAULT 'PENDING'")
    @Builder.Default
    private RegistrationStatus status = RegistrationStatus.PENDING;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

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
