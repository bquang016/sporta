package com.backend.sporta.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class OwnerReplyRequest {

    @NotBlank(message = "Nội dung phản hồi không được để trống")
    @Size(max = 500, message = "Phản hồi không được vượt quá 500 ký tự")
    private String reply;
}
