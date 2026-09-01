package com.backend.sporta.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicUserProfileResponse {
    private Long id;
    private String fullName;
    private String avatarUrl;
    private String gender; // "MALE", "FEMALE", "OTHER" or null
    private Integer height; // in cm
    private Double weight; // in kg
    private Integer joinedYear; // e.g. 2025
    private String role; // "PLAYER", "VENUE_OWNER", "ADMIN"
    private Integer totalBookings;
    private Integer reputationScore;

    // Hồ sơ bộ môn thể thao (dựa trên số lượt đặt sân của từng môn)
    private List<SportBookingStatDto> sports;

    // Các câu lạc bộ đã tham gia
    private List<UserClubSummaryDto> joinedClubs;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SportBookingStatDto {
        private Long sportId;
        private String sportName;
        private String sportIcon;
        private Integer bookingCount; // Số lượt đặt sân
        private Integer percentage; // Tỷ lệ %
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserClubSummaryDto {
        private Long clubId;
        private String clubName;
        private String avatarImage;
        private String coverImage;
        private String sportName;
        private String role; // "ADMIN", "SUB_LEADER", "MEMBER"
        private Integer membersCount;
        private Integer elo;
    }
}
