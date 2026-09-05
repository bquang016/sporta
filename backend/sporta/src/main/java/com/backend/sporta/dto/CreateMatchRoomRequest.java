package com.backend.sporta.dto;

import com.backend.sporta.enums.MatchType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class CreateMatchRoomRequest {
    @NotNull(message = "Booking ID is required")
    private UUID bookingId;

    @NotNull(message = "Host Club ID is required")
    private Long hostClubId;

    @NotNull(message = "Match Type is required")
    private MatchType matchType;

    @Min(value = 0, message = "Host percent must be between 0 and 100")
    @Max(value = 100, message = "Host percent must be between 0 and 100")
    private Integer hostSharePercent = 50;

    private List<String> desiredLevels;

    private String note;

    private Long lineupId;
}
