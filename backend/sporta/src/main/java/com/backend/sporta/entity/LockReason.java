package com.backend.sporta.entity;

import jakarta.persistence.*;
import lombok.*;
import com.backend.sporta.enums.Role;

@Entity
@Table(name = "lock_reasons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LockReason {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "reason_text", nullable = false, length = 500)
    private String reasonText;

    @Column(name = "is_default", nullable = false)
    @Builder.Default
    private Boolean isDefault = false;
}
