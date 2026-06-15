package com.backend.sporta.dto;

import com.backend.sporta.entity.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class RegisterRequest {
    @NotBlank(message = "Registration token không được để trống")
    private String registrationToken;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;

    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;

    @NotNull(message = "Gender is required")
    private Gender gender;

    @NotNull(message = "Date of birth is required")
    private LocalDate dateOfBirth;

    @NotEmpty(message = "At least one sport must be selected")
    private List<SportProfileDto> sports;
}
