package com.backend.sporta.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "court_pricing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourtPricing {

    @Id
    @GeneratedValue
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "UUID")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "court_id", nullable = false)
    private Court court;

    @Column(name = "slot_label", nullable = false)
    private String slotLabel; // e.g. "Sáng", "Trưa", "Chiều", "Tối"

    @Column(name = "start_time", nullable = false)
    private String startTime; // "05:00"

    @Column(name = "end_time", nullable = false)
    private String endTime; // "11:00"

    @Column(name = "price", nullable = false)
    private Double price;
}
