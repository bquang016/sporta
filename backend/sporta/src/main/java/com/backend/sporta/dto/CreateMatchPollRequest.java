package com.backend.sporta.dto;

import com.backend.sporta.enums.PollType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateMatchPollRequest {

    @NotBlank(message = "Tiêu đề biểu quyết không được để trống")
    private String title;

    @NotNull(message = "Loại biểu quyết không được để trống")
    private PollType pollType; // INTERNAL, MATCHMAKING

    private LocalDateTime deadline;

    private Integer maxPlayers; // Tối đa số người tham gia (dùng cho MATCHMAKING hoặc INTERNAL)

    private Integer minPlayers; // Tối thiểu số người

    private List<String> customOptions; // Các lựa chọn thêm tùy ý: "Rủ bạn theo", "Suy nghĩ thêm",...
}
