package com.backend.sporta.dto;

import com.backend.sporta.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserProfileRequest {
    private String fullName;
    private String phoneNumber;
    private Gender gender;
    
    private String dateOfBirth;

    private Integer height;
    private Double weight;
}
