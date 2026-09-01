package com.backend.sporta.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(columnDefinition = "TEXT")
    private String content;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "post_media_urls", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "media_url", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> mediaUrls = new ArrayList<>();

    @Column(name = "post_type")
    @Builder.Default
    private String type = "COMMUNITY";

    @Column(name = "audience")
    @Builder.Default
    private String audience = "PUBLIC";

    @Column(name = "background_gradient")
    private String backgroundGradient;

    @Column(name = "background_id")
    private String backgroundId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id")
    private Club club;

    @Column(name = "match_room_id")
    private String matchRoomId;

    // Sport details for Match Finding posts
    private String sportName;
    private String venueName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id")
    private Venue venue;

    private String timeSlot;
    private String memberFee;

    @Column(name = "play_date")
    private java.time.LocalDate playDate;

    @Column(name = "start_time")
    private java.time.LocalTime startTime;

    @Column(name = "end_time")
    private java.time.LocalTime endTime;

    @Column(name = "target_level")
    private String targetLevel;

    @Builder.Default
    @Column(name = "slots_needed")
    private Integer slotsNeeded = 0;

    @Builder.Default
    @Column(name = "current_slots")
    private Integer currentSlots = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "match_status")
    private com.backend.sporta.enums.MatchStatus matchStatus;

    @Column(name = "member_fee_amount")
    private Double memberFeeAmount;

    @Column(name = "total_price")
    private Long totalPrice;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Builder.Default
    @Column(name = "currency")
    private String currency = "VND";

    // Promo details for Venue Promo posts
    private String promoTitle;
    private String promoCode;
    private String discountText;

    @Column(name = "valid_until")
    private LocalDateTime validUntil;

    /** Voucher gắn kèm bài viết (nullable — Q7/Q14: 1 voucher/bài viết) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voucher_id")
    private Voucher voucher;

    @Builder.Default
    @Column(name = "like_count")
    private Integer likeCount = 0;

    @Builder.Default
    @Column(name = "comment_count")
    private Integer commentCount = 0;

    @Builder.Default
    @Column(name = "share_count")
    private Integer shareCount = 0;

    @Builder.Default
    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
        if (likeCount == null) likeCount = 0;
        if (commentCount == null) commentCount = 0;
        if (shareCount == null) shareCount = 0;
        if (slotsNeeded == null) slotsNeeded = 0;
        if (currentSlots == null) currentSlots = 0;
        if ("MATCH_FINDING".equalsIgnoreCase(type) && matchStatus == null) {
            matchStatus = com.backend.sporta.enums.MatchStatus.OPEN;
        }
        if (currency == null) currency = "VND";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
