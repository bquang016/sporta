package com.backend.sporta.entity;

import jakarta.persistence.*;
import lombok.*;

import com.backend.sporta.enums.Gender;
import com.backend.sporta.enums.Role;
import com.backend.sporta.enums.UserStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "height_cm")
    private Integer height;

    @Column(name = "weight_kg")
    private Double weight;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status;

    @Column(name = "must_change_password")
    @Builder.Default
    private Boolean mustChangePassword = false;

    // --- Cờ cài đặt (Settings Flags) ---
    @Column(name = "notif_booking")
    @Builder.Default
    private Boolean notifBooking = true;

    @Column(name = "notif_promo")
    @Builder.Default
    private Boolean notifPromo = true;

    @Column(name = "notif_matchmake")
    @Builder.Default
    private Boolean notifMatchmake = true;

    @Column(name = "enable_biometrics")
    @Builder.Default
    private Boolean enableBiometrics = true;

    @Column(name = "private_mode")
    @Builder.Default
    private Boolean privateMode = false;
    // ------------------------------------

    public boolean isMustChangePassword() {
        return this.mustChangePassword != null && this.mustChangePassword;
    }

    @Column(name = "is_deleted")
    @Builder.Default
    private Boolean isDeleted = false;

    public boolean getIsDeleted() {
        return this.isDeleted != null && this.isDeleted;
    }

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.isDeleted == null) {
            this.isDeleted = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
