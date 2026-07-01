package com.backend.sporta.entity;

import com.backend.sporta.enums.ApprovalStatus;
import com.backend.sporta.enums.VenueStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "venues")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Venue {


    @Id
    @GeneratedValue
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "UUID")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private Owner owner;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "location")
    private String location;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "province")
    private String province;

    @Column(name = "district")
    private String district;

    @Column(name = "ward")
    private String ward;

    @Column(name = "sport_types", columnDefinition = "TEXT")
    private String sportTypes;

    @Column(name = "sub_court_count")
    private Integer subCourtCount;

    @Column(name = "registration_images", columnDefinition = "TEXT")
    private String registrationImages;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // QUAN TRỌNG: Đổi sang LocalTime để dễ tính toán logic chia ca
    @Column(name = "opening_time", nullable = false)
    private LocalTime openingTime;

    @Column(name = "closing_time", nullable = false)
    private LocalTime closingTime;

    @Column(name = "shift_duration_minutes", nullable = false)
    @Builder.Default
    private Integer shiftDurationMinutes = 30;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sport_id")
    private Sport sport;

    @Column(name = "cover_image", columnDefinition = "TEXT")
    private String coverImage;

    @OneToMany(mappedBy = "venue", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<VenueImage> images = new ArrayList<>();

    // TÍNH NĂNG: Phụ thu (Surcharge)
    @Column(name = "has_surcharge", nullable = false)
    @Builder.Default
    private Boolean hasSurcharge = false;

    @Column(name = "surcharge_amount")
    private Double surchargeAmount;

    @Column(name = "surcharge_description", columnDefinition = "TEXT")
    private String surchargeDescription;

    // TRẠNG THÁI: Trạng thái vật lý của sân (Đang mở/Đóng cửa)
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "VARCHAR(50)")
    @Builder.Default
    private VenueStatus status = VenueStatus.ACTIVE;

    // TRẠNG THÁI: Trạng thái kiểm duyệt của hệ thống
    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false)
    @Builder.Default
    private ApprovalStatus approvalStatus = ApprovalStatus.APPROVED;

    @Column(name = "min_price")
    @Builder.Default
    private Double minPrice = 0.0;

    @Column(name = "max_price")
    @Builder.Default
    private Double maxPrice = 0.0;

    public Double getMinPrice() {
        return minPrice != null ? minPrice : 0.0;
    }

    public Double getMaxPrice() {
        return maxPrice != null ? maxPrice : 0.0;
    }

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