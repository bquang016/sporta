package com.backend.sporta.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubMatchResponse {
    private Long id;
    private String matchId;
    private Long opponentClubId;
    private String opponentName;
    private String opponentAvatar;
    private String date; // formatted "dd/MM/yyyy HH:mm"
    private Integer ourScore;
    private Integer opponentScore;
    private String scoreText;
    private String result; // "win", "lose", "draw"
    private Integer crpDelta;
    private String location;
    private String matchType;
}
