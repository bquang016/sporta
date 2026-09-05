package com.backend.sporta.service.ai;

import com.backend.sporta.entity.Post;
import com.backend.sporta.enums.MatchStatus;
import lombok.Builder;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Slf4j
@Component
public class PostRankingEngine {

    private static final double EARTH_RADIUS_KM = 6371.0;
    private static final double TIME_DECAY_EXPONENT = 1.4;

    @Data
    @Builder
    public static class UserFeedContext {
        private Long userId;
        private Double latitude;
        private Double longitude;
        private String district;
        private String province;
        @Builder.Default
        private Set<String> favoriteSports = new HashSet<>();
        @Builder.Default
        private Set<Long> clubMemberUserIds = new HashSet<>();
        @Builder.Default
        private Set<UUID> bookedVenueIds = new HashSet<>();
        private Integer userSkillRank; // 1 to 5
    }

    @Data
    @Builder
    public static class ScoredPost {
        private Post post;
        private double totalScore;
        private double baseScore;
        private double affinityScore;
        private double locationScore;
        private double urgencyScore;
        private double levelScore;
        private double ageHours;
    }

    /**
     * Tính điểm tổng hợp cho 1 bài viết dựa trên context người dùng
     */
    public ScoredPost scorePost(Post post, UserFeedContext context, LocalDateTime now) {
        double baseScore = computeBaseScore(post);
        double affinityScore = computeAffinityScore(post, context);
        double locationScore = computeLocationScore(post, context);
        double urgencyScore = computeUrgencyScore(post, now);
        double levelScore = computeLevelScore(post, context);

        // Calculate age in hours
        double ageHours = 0.0;
        if (post.getCreatedAt() != null) {
            Duration duration = Duration.between(post.getCreatedAt(), now);
            ageHours = Math.max(0.0, duration.toMinutes() / 60.0);
        }

        // If match post is expired / invalid -> drop score to negative so it gets filtered
        if ("MATCH_FINDING".equalsIgnoreCase(post.getType()) && urgencyScore <= -900.0) {
            return ScoredPost.builder()
                    .post(post)
                    .totalScore(-999.0)
                    .baseScore(baseScore)
                    .affinityScore(affinityScore)
                    .locationScore(locationScore)
                    .urgencyScore(urgencyScore)
                    .levelScore(levelScore)
                    .ageHours(ageHours)
                    .build();
        }

        double numerator = baseScore + affinityScore + locationScore + urgencyScore + levelScore;
        double denominator = Math.pow(ageHours + 2.0, TIME_DECAY_EXPONENT);
        double finalScore = numerator / denominator;

        return ScoredPost.builder()
                .post(post)
                .totalScore(finalScore)
                .baseScore(baseScore)
                .affinityScore(affinityScore)
                .locationScore(locationScore)
                .urgencyScore(urgencyScore)
                .levelScore(levelScore)
                .ageHours(ageHours)
                .build();
    }

    /**
     * S_Base = min(100, 25 * ln(1 + RawEngagement)) + 15 * I(hasMedia)
     */
    public double computeBaseScore(Post post) {
        int likes = post.getLikeCount() != null ? Math.max(0, post.getLikeCount()) : 0;
        int comments = post.getCommentCount() != null ? Math.max(0, post.getCommentCount()) : 0;
        int shares = post.getShareCount() != null ? Math.max(0, post.getShareCount()) : 0;
        boolean hasMedia = post.getMediaUrls() != null && !post.getMediaUrls().isEmpty();

        double rawEngagement = (1.0 * likes) + (3.0 * comments) + (5.0 * shares);
        double engagementScore = Math.min(100.0, 25.0 * Math.log(1.0 + rawEngagement));
        double mediaBonus = hasMedia ? 15.0 : 0.0;

        return engagementScore + mediaBonus;
    }

    /**
     * S_Affinity = 40 * I(Sport) + 30 * I(Club) + 20 * I(BookedVenue)
     */
    public double computeAffinityScore(Post post, UserFeedContext context) {
        if (context == null) return 0.0;
        double score = 0.0;

        // 1. Trùng môn thể thao yêu thích
        if (post.getSportName() != null && !post.getSportName().isBlank() && context.getFavoriteSports() != null) {
            String postSportNorm = normalizeString(post.getSportName());
            boolean matched = context.getFavoriteSports().stream()
                    .anyMatch(fav -> normalizeString(fav).contains(postSportNorm) || postSportNorm.contains(normalizeString(fav)));
            if (matched) {
                score += 40.0;
            }
        }

        // 2. Tác giả cùng CLB
        if (post.getAuthor() != null && context.getClubMemberUserIds() != null) {
            if (context.getClubMemberUserIds().contains(post.getAuthor().getId())) {
                score += 30.0;
            }
        }

        // 3. Sân bóng người dùng từng đặt
        if (post.getVenue() != null && context.getBookedVenueIds() != null) {
            if (context.getBookedVenueIds().contains(post.getVenue().getId())) {
                score += 20.0;
            }
        }

        return score;
    }

    /**
     * S_Location = 50 * exp(-d / 8.0) hoặc 30 (cùng quận)
     */
    public double computeLocationScore(Post post, UserFeedContext context) {
        if (context == null) return 0.0;

        // Ưu tiên tính GPS nếu cả 2 bên đều có toạ độ
        if (context.getLatitude() != null && context.getLongitude() != null &&
            post.getVenue() != null && post.getVenue().getLatitude() != null && post.getVenue().getLongitude() != null) {
            
            double distKm = haversineDistance(
                    context.getLatitude(), context.getLongitude(),
                    post.getVenue().getLatitude(), post.getVenue().getLongitude()
            );
            return 50.0 * Math.exp(-distKm / 8.0);
        }

        // Fallback: Cùng Quận/Huyện
        if (context.getDistrict() != null && post.getVenue() != null && post.getVenue().getDistrict() != null) {
            String uDist = normalizeString(context.getDistrict());
            String vDist = normalizeString(post.getVenue().getDistrict());
            if (!uDist.isBlank() && !vDist.isBlank() && (uDist.contains(vDist) || vDist.contains(uDist))) {
                return 30.0;
            }
        }

        return 0.0;
    }

    /**
     * S_Urgency = Hàm chia đoạn thời gian đếm ngược
     */
    public double computeUrgencyScore(Post post, LocalDateTime now) {
        if (!"MATCH_FINDING".equalsIgnoreCase(post.getType())) {
            return 0.0;
        }

        // Nếu bài đã FULL, CANCELLED hoặc EXPIRED -> trừ điểm tối đa
        if (post.getMatchStatus() != null && post.getMatchStatus() != MatchStatus.OPEN) {
            return -999.0;
        }

        if (post.getPlayDate() == null) {
            return 0.0;
        }

        LocalTime startTime = post.getStartTime() != null ? post.getStartTime() : LocalTime.of(18, 0);
        LocalTime endTime = post.getEndTime() != null ? post.getEndTime() : startTime.plusHours(2);
        LocalDateTime matchStartDateTime = LocalDateTime.of(post.getPlayDate(), startTime);
        LocalDateTime matchEndDateTime = LocalDateTime.of(post.getPlayDate(), endTime);

        // Kèo đã quá giờ kết thúc hoặc bắt đầu
        if (now.isAfter(matchEndDateTime)) {
            return -999.0;
        }

        Duration durationToStart = Duration.between(now, matchStartDateTime);
        double deltaHours = durationToStart.toMinutes() / 60.0;

        if (deltaHours < 0) {
            // Trận đấu đang diễn ra
            return 10.0;
        } else if (deltaHours <= 6.0) {
            // Đỉnh điểm tại 3 tiếng trước trận
            return 80.0 * (1.0 - Math.abs(deltaHours - 3.0) / 3.0) + 20.0;
        } else if (deltaHours <= 24.0) {
            return 40.0 * (1.0 - (deltaHours - 6.0) / 18.0);
        } else if (deltaHours <= 72.0) {
            return 10.0;
        } else {
            return 0.0;
        }
    }

    /**
     * S_Level = 30 (khớp), 15 (lệch 1), 0 (lệch >= 2)
     */
    public double computeLevelScore(Post post, UserFeedContext context) {
        if (context == null || context.getUserSkillRank() == null || post.getTargetLevel() == null) {
            return 0.0;
        }

        int targetRank = mapLevelToRank(post.getTargetLevel());
        if (targetRank <= 0) return 0.0;

        int userRank = context.getUserSkillRank();
        int diff = Math.abs(userRank - targetRank);

        if (diff == 0) return 30.0;
        if (diff == 1) return 15.0;
        return 0.0;
    }

    public int mapLevelToRank(String levelStr) {
        if (levelStr == null) return 0;
        String norm = normalizeString(levelStr);
        if (norm.contains("yeu") || norm.contains("moi choi") || norm.contains("beginner") || norm.contains("1.")) return 1;
        if (norm.contains("phong trao") || norm.contains("casual") || norm.contains("2.")) return 2;
        if (norm.contains("trung binh") || norm.contains("intermediate") || norm.contains("3.0") || norm.contains("3.5")) return 3;
        if (norm.contains("kha") || norm.contains("advanced") || norm.contains("4.0") || norm.contains("4.5")) return 4;
        if (norm.contains("ban chuyen") || norm.contains("chuyen nghiep") || norm.contains("pro") || norm.contains("5.")) return 5;
        return 3; // Default intermediate
    }

    public double haversineDistance(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double rLat1 = Math.toRadians(lat1);
        double rLat2 = Math.toRadians(lat2);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    private String normalizeString(String input) {
        if (input == null) return "";
        return java.text.Normalizer.normalize(input, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .toLowerCase()
                .trim();
    }
}
