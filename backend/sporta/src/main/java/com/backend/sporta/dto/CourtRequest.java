package com.backend.sporta.dto;

import com.backend.sporta.enums.CourtStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourtRequest {

    @NotBlank(message = "Tên sân không được để trống")
    private String name;

    @NotNull(message = "Giá thuê không được để trống")
    private Double price;

    @NotBlank(message = "Cụm sân không được để trống")
    private String venueId;

    private CourtStatus status;
}
