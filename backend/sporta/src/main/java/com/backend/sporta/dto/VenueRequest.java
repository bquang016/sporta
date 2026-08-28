package com.backend.sporta.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalTime;
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

    private String province;
    private String district;
    private String ward;
    private String addressDetail;

    private LocalTime openingTime;
    private LocalTime closingTime;

    private Integer shiftDurationMinutes;

    // ĐÃ SỬA LẠI THÀNH LONG THEO ĐÚNG DATABASE CỦA BẠN
    private Long sportId; 

    private String coverImage;
    private List<String> detailImages;

    private Boolean hasSurcharge;
    private Double surchargeAmount;
    private String surchargeDescription;
}