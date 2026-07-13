package com.backend.sporta.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubMatchResponse {
    private Long id;
    private String opponentName;
    private String opponentAvatar;
    private String date; // formatted "dd/MM/yyyy"
    private Integer ourScore;
    private Integer opponentScore;
    private String result; // "win", "lose", "draw"
    private String location;
}
