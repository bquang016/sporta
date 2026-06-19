package com.backend.sporta.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

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

    private String description;
}
