package com.backend.sporta.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.List;

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

    private String description;

    private String coverImage;

    @NotBlank(message = "Giờ mở cửa không được để trống")
    private String openingTime;

    @NotBlank(message = "Giờ đóng cửa không được để trống")
    private String closingTime;

    @NotBlank(message = "Vị trí không được để trống")
    private String location;

    @NotNull(message = "Môn thể thao không được để trống")
    private Long sportId;

    private List<String> detailImages;
}
