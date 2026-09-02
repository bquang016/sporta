package com.backend.sporta.dto;

import com.backend.sporta.enums.Gender;
import com.backend.sporta.enums.Role;
import com.backend.sporta.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {
    private Long id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String avatarUrl;
    private Gender gender;
    private LocalDate dateOfBirth;
    private Role role;
    private UserStatus status;
    private Integer height;
    private Double weight;
    private Boolean isDevTester;
    private List<UserSportDto> sports;
    private Boolean notifBooking;
    private Boolean notifPromo;
    private Boolean notifMatchmake;
    private Boolean enableBiometrics;
    private Boolean privateMode;
}
