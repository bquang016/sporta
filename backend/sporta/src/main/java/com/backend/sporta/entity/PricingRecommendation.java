package com.backend.sporta.entity;

import com.backend.sporta.enums.ConfidenceLevel;
import com.backend.sporta.enums.RecommendationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "pricing_recommendations", indexes = {
        @Index(name = "idx_pr_court_status", columnList = "court_id, status"),
        @Index(name = "idx_pr_court_dow_time", columnList = "court_id, day_of_week, start_time")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PricingRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "court_id", nullable = false)
    private Court court;

    @Column(name = "day_of_week", nullable = false)
    private Integer dayOfWeek; // 1 = Monday ... 7 = Sunday

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    /** Giá gốc tĩnh bất biến của sân (Court.price) */
    @Column(name = "base_price", nullable = false)
    private Double basePrice;

    /** Hệ số ngày trong tuần */
    @Column(name = "day_factor", nullable = false)
    private Double dayFactor;

    /** Hệ số khung giờ 24h */
    @Column(name = "time_slot_factor", nullable = false)
    private Double timeSlotFactor;

    /** Hệ số tỷ lệ lấp đầy */
    @Column(name = "occupancy_factor", nullable = false)
    private Double occupancyFactor;

    /** Tỷ lệ lấp đầy hiệu dụng (đã hòa trộn cold-start nếu có) */
    @Column(name = "occupancy_rate", nullable = false)
    private Double occupancyRate;

    /** Giá thô trước khi kẹp biên và làm tròn */
    @Column(name = "raw_price", nullable = false)
    private Double rawPrice;

    /** Giá đề xuất cuối cùng (đã kẹp biên ±20% và làm tròn an toàn) */
    @Column(name = "suggested_price", nullable = false)
    private Double suggestedPrice;

    /** Phần trăm chênh lệch so với basePrice (Ví dụ: +20.0 hoặc -16.7) */
    @Column(name = "price_change_percentage", nullable = false)
    private Double priceChangePercentage;

    /** Chuỗi giải thích lý do đề xuất hiển thị trên UI */
    @Column(name = "recommendation_reason", nullable = false, length = 500)
    private String recommendationReason;

    /** Mức độ tin cậy của thuật toán: HIGH, MEDIUM, LOW */
    @Enumerated(EnumType.STRING)
    @Column(name = "confidence_level", nullable = false)
    private ConfidenceLevel confidenceLevel;

    /** Trạng thái đề xuất: PENDING, APPLIED, REJECTED, EXPIRED */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private RecommendationStatus status = RecommendationStatus.PENDING;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.expiresAt == null) {
            this.expiresAt = this.createdAt.plusHours(48);
        }
    }
}
