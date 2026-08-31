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

    @Column(name = "gender")
    private String gender;

    @Column(name = "nationality")
    private String nationality;

    @Column(name = "hometown")
    private String hometown;

    @Column(name = "permanent_address", columnDefinition = "TEXT")
    private String permanentAddress;

    @Column(name = "phone_number")
    private String phoneNumber;

    // ── Venue info ──
    @Column(name = "venue_name", nullable = false)
    private String venueName;

    @Column(name = "province")
    private String province;

    @Column(name = "district")
    private String district;

    @Column(name = "address_detail")
    private String addressDetail;

    @Column(name = "ward")
    private String ward;

    @Column(name = "cover_image", columnDefinition = "TEXT")
    private String coverImage;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "sport_id")
    private Long sportId;

    @Column(name = "opening_time")
    private java.time.LocalTime openingTime;

    @Column(name = "closing_time")
    private java.time.LocalTime closingTime;

    @Column(name = "shift_duration_minutes")
    private Integer shiftDurationMinutes;

    @Column(name = "has_surcharge")
    @Builder.Default
    private Boolean hasSurcharge = false;

    @Column(name = "surcharge_amount")
    private Double surchargeAmount;

    @Column(name = "surcharge_description", columnDefinition = "TEXT")
    private String surchargeDescription;

    @Column(name = "sub_court_count")
    private int subCourtCount;

    @Column(name = "free_cancellation_hours")
    private Integer freeCancellationHours;

    @Column(name = "late_cancellation_refund_rate")
    private Integer lateCancellationRefundRate;

    @Column(name = "rain_reschedule_allowed")
    private Boolean rainRescheduleAllowed;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "registration_images", columnDefinition = "TEXT")
    private String registrationImages;

    @Column(name = "courts_json", columnDefinition = "TEXT")
    private String courtsJson;

    // ── Status ──
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "VARCHAR(50)")
    @Builder.Default
    private RegistrationStatus status = RegistrationStatus.PENDING;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ── Contract Signature (Temporary before approval) ──
    @Column(name = "is_contract_signed")
    @Builder.Default
    private Boolean isContractSigned = false;

    @Column(name = "signature_ip", columnDefinition = "VARCHAR(45)")
    private String signatureIp;

    @Column(name = "signature_timestamp")
    private LocalDateTime signatureTimestamp;

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
