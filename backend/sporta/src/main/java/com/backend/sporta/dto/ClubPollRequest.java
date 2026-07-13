package com.backend.sporta.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubPollRequest {

    @NotBlank(message = "Tiêu đề bình chọn không được để trống")
    private String title;

    @NotBlank(message = "Thời gian đóng bình chọn không được để trống")
    private String closeTime; // Format "HH:mm" e.g. "15:00"
}
