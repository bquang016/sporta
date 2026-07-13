package com.backend.sporta.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubMatchRequest {

    @NotBlank(message = "Tên đối thủ không được để trống")
    private String opponentName;

    private String opponentAvatar;

    @NotNull(message = "Ngày thi đấu không được để trống")
    private LocalDate date;

    @NotNull(message = "Điểm số của CLB không được để trống")
    private Integer ourScore;

    @NotNull(message = "Điểm số của đối thủ không được để trống")
    private Integer opponentScore;

    @NotBlank(message = "Kết quả không được để trống")
    private String result; // "win", "lose", "draw"

    private String location;
}
