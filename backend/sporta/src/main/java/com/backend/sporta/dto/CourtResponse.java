package com.backend.sporta.dto;

import com.backend.sporta.enums.CourtStatus;
import lombok.*;
import java.time.LocalDateTime;
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
    private UUID venueId;
    private String venueName;
    private CourtStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
