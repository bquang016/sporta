package com.backend.sporta.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourtImageDto {
    private Long id;
    private String imageUrl;
}
