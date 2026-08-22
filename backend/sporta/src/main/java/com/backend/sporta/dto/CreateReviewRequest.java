package com.backend.sporta.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateReviewRequest {

    @NotNull(message = "Vui lòng chọn sân cần đánh giá")
    private UUID venueId;

    @NotNull(message = "Vui lòng chọn số sao đánh giá")
    @Min(value = 1, message = "Số sao tối thiểu là 1")
    @Max(value = 5, message = "Số sao tối đa là 5")
    private Integer rating;

    @Size(max = 1000, message = "Nhận xét không được vượt quá 1000 ký tự")
    private String comment;
}
