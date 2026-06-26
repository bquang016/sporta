package com.backend.sporta.dto;

import com.backend.sporta.enums.CourtStatus;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourtResponse {
    private UUID id;
    private UUID ownerId;
    private String ownerName;
    private String name;
    private Double price;
    private String description;
    private String coverImage;
    private String openingTime;
    private String closingTime;
    private String location;
    private Long sportId;
    private String sportName;
    private UUID venueId;
    private String venueName;
    private String rejectionReason;
    private CourtStatus status;
    private List<CourtImageDto> detailImages;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
