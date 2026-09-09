package com.backend.sporta.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlatformStatsResponse {
    private long verifiedVenues;
    private long openMatchRooms;
    private long todayTickets;

    private String verifiedVenuesDisplay;
    private String openMatchRoomsDisplay;
    private String todayTicketsDisplay;
}
