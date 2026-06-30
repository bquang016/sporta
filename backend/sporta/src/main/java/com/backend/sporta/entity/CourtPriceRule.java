package com.backend.sporta.entity;

import com.backend.sporta.enums.PriceRuleType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "court_price_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourtPriceRule {

    @Id
    @GeneratedValue
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "UUID")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "court_id", nullable = false)
    private Court court;

    @Enumerated(EnumType.STRING)
    @Column(name = "rule_type", nullable = false)
    private PriceRuleType ruleType;

    // ===== Dành cho Rule theo CA (SHIFT) =====
    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "custom_price")
    private Double customPrice;

    // ===== Dành cho Rule theo NGÀY (DAY_OF_WEEK) =====
    // Dùng số 1-7 (VD: 1=Thứ 2, 7=Chủ Nhật) hoặc Java DayOfWeek
    @Column(name = "day_of_week")
    private Integer dayOfWeek; 

    // % tăng/giảm giá (VD: 1.2 = Tăng 20%, 0.8 = Giảm 20%)
    @Column(name = "percentage_modifier")
    private Double percentageModifier;

    // Cộng/Trừ thẳng tiền (VD: +20000)
    @Column(name = "fixed_modifier")
    private Double fixedModifier;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}