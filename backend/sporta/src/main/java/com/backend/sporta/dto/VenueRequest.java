package com.backend.sporta.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VenueRequest {
    @NotBlank(message = "Tên cụm sân không được để trống")
    private String name;

    @NotBlank(message = "Vị trí không được để trống")
    private String location;

    private Double latitude;

    private Double longitude;

    private String description;

    private String openingTime;

    private String closingTime;

    private Integer shiftDurationMinutes;

    private Long sportId;

    private String coverImage;

    private List<String> detailImages;
}
