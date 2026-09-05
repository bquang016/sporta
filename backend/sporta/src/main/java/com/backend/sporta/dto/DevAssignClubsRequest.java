package com.backend.sporta.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DevAssignClubsRequest {
    private Long hostClubId;
    private Long guestClubId;
}
