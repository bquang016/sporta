package com.backend.sporta.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "venue_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VenueImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id", nullable = false)
    @JsonIgnore
    private Venue venue;

    @Column(name = "image_url", nullable = false, columnDefinition = "TEXT")
    private String imageUrl;
}
