package com.backend.sporta.service.ai;

import com.backend.sporta.entity.Post;
import com.backend.sporta.entity.User;
import com.backend.sporta.entity.Venue;
import com.backend.sporta.enums.MatchStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

public class PostRankingEngineTest {

    private PostRankingEngine rankingEngine;

    @BeforeEach
    public void setup() {
        rankingEngine = new PostRankingEngine();
    }

    @Test
    @DisplayName("S_Base: Logarithmic Scaling accurately computes and caps at 115.0")
    public void testComputeBaseScore_LogarithmicScaling() {
        // 0 engagement, no media -> 0.0
        Post p0 = Post.builder().likeCount(0).commentCount(0).shareCount(0).build();
        assertEquals(0.0, rankingEngine.computeBaseScore(p0), 0.01);

        // 0 engagement, with media -> 15.0
        Post p0Media = Post.builder().likeCount(0).commentCount(0).shareCount(0).mediaUrls(List.of("url1")).build();
        assertEquals(15.0, rankingEngine.computeBaseScore(p0Media), 0.01);

        // Raw = 10 (10 likes) -> 25 * ln(11) = 59.95
        Post p10 = Post.builder().likeCount(10).commentCount(0).shareCount(0).build();
        assertEquals(59.95, rankingEngine.computeBaseScore(p10), 0.1);

        // Raw = 50 (14 likes, 7 comments, 3 shares -> 14 + 21 + 15 = 50) -> 25 * ln(51) = 98.29
        Post p50 = Post.builder().likeCount(14).commentCount(7).shareCount(3).build();
        assertEquals(98.29, rankingEngine.computeBaseScore(p50), 0.1);

        // Viral Post (500 likes, 100 comments, 20 shares) -> Raw = 900 -> capped at min(100, ...) = 100.0 (+ 15 media = 115.0)
        Post pViral = Post.builder().likeCount(500).commentCount(100).shareCount(20).mediaUrls(List.of("url1")).build();
        assertEquals(115.0, rankingEngine.computeBaseScore(pViral), 0.01);
    }

    @Test
    @DisplayName("S_Urgency: Peaks at 3 hours before match and filters expired matches with -999.0")
    public void testComputeUrgencyScore() {
        LocalDate today = LocalDate.of(2026, 8, 31);
        LocalDateTime now = LocalDateTime.of(today, LocalTime.of(16, 0));

        // 1. Kèo đúng 3 tiếng sau (19:00) -> 100.0 điểm
        Post match3h = Post.builder()
                .type("MATCH_FINDING")
                .matchStatus(MatchStatus.OPEN)
                .playDate(today)
                .startTime(LocalTime.of(19, 0))
                .endTime(LocalTime.of(21, 0))
                .build();
        assertEquals(100.0, rankingEngine.computeUrgencyScore(match3h, now), 0.01);

        // 2. Kèo 2 tiếng sau (18:00) -> 80 * (1 - 1/3) + 20 = 73.33 điểm
        Post match2h = Post.builder()
                .type("MATCH_FINDING")
                .matchStatus(MatchStatus.OPEN)
                .playDate(today)
                .startTime(LocalTime.of(18, 0))
                .endTime(LocalTime.of(20, 0))
                .build();
        assertEquals(73.33, rankingEngine.computeUrgencyScore(match2h, now), 0.1);

        // 3. Kèo đã quá giờ (14:00 - 15:30) -> -999.0
        Post matchExpired = Post.builder()
                .type("MATCH_FINDING")
                .matchStatus(MatchStatus.OPEN)
                .playDate(today)
                .startTime(LocalTime.of(14, 0))
                .endTime(LocalTime.of(15, 30))
                .build();
        assertEquals(-999.0, rankingEngine.computeUrgencyScore(matchExpired, now), 0.01);
    }

    @Test
    @DisplayName("S_Location: Haversine distance matches exponential decay curve")
    public void testComputeLocationScore() {
        // User at Cau Giay (21.0333, 105.7900)
        PostRankingEngine.UserFeedContext context = PostRankingEngine.UserFeedContext.builder()
                .latitude(21.0333)
                .longitude(105.7900)
                .district("Cầu Giấy")
                .build();

        // Venue 1.6 km away -> 50 * exp(-1.6 / 8.0) = 40.94
        Venue v1 = Venue.builder()
                .id(UUID.randomUUID())
                .latitude(21.0450)
                .longitude(105.7980)
                .district("Cầu Giấy")
                .build();
        Post p1 = Post.builder().venue(v1).build();
        assertEquals(40.94, rankingEngine.computeLocationScore(p1, context), 1.0);
    }

    @Test
    @DisplayName("S_Level: Exact rank = 30, Adjacent rank = 15, Distant = 0")
    public void testComputeLevelScore() {
        PostRankingEngine.UserFeedContext context = PostRankingEngine.UserFeedContext.builder()
                .userSkillRank(3) // Intermediate (Rank 3)
                .build();

        Post pExact = Post.builder().targetLevel("DUPR 3.0+ (Trung bình)").build();
        assertEquals(30.0, rankingEngine.computeLevelScore(pExact, context), 0.01);

        Post pAdjacent = Post.builder().targetLevel("Khá (Rank 4)").build();
        assertEquals(15.0, rankingEngine.computeLevelScore(pAdjacent, context), 0.01);

        Post pDistant = Post.builder().targetLevel("Yếu / Mới chơi (Rank 1)").build();
        assertEquals(0.0, rankingEngine.computeLevelScore(pDistant, context), 0.01);
    }

    @Test
    @DisplayName("Ground-Truth Ranking Verification: Post A (urgent match) beats Viral Post C due to proximity & urgency")
    public void testGroundTruthRanking() {
        LocalDate today = LocalDate.of(2026, 8, 31);
        LocalDateTime now = LocalDateTime.of(today, LocalTime.of(16, 0));

        PostRankingEngine.UserFeedContext context = PostRankingEngine.UserFeedContext.builder()
                .userId(1L)
                .latitude(21.0333)
                .longitude(105.7900)
                .favoriteSports(Set.of("Pickleball"))
                .userSkillRank(3)
                .build();

        Venue vA = Venue.builder().id(UUID.randomUUID()).latitude(21.0450).longitude(105.7980).build();
        Post postA = Post.builder()
                .type("MATCH_FINDING")
                .sportName("Pickleball")
                .matchStatus(MatchStatus.OPEN)
                .venue(vA)
                .playDate(today)
                .startTime(LocalTime.of(19, 0))
                .endTime(LocalTime.of(21, 0))
                .targetLevel("DUPR 3.0")
                .likeCount(10)
                .commentCount(4)
                .shareCount(0)
                .mediaUrls(List.of("img1"))
                .createdAt(now.minusHours(1))
                .build();

        Venue vC = Venue.builder().id(UUID.randomUUID()).latitude(21.0480).longitude(105.7990).build();
        Post postC = Post.builder()
                .type("COMMUNITY")
                .sportName("Pickleball")
                .venue(vC)
                .likeCount(200)
                .commentCount(50)
                .shareCount(10)
                .mediaUrls(List.of("img1", "img2"))
                .createdAt(now.minusHours(3))
                .build();

        PostRankingEngine.ScoredPost scoreA = rankingEngine.scorePost(postA, context, now);
        PostRankingEngine.ScoredPost scoreC = rankingEngine.scorePost(postC, context, now);

        assertTrue(scoreA.getTotalScore() > scoreC.getTotalScore(), 
                "Post A (Score " + scoreA.getTotalScore() + ") must rank higher than Post C (Score " + scoreC.getTotalScore() + ")");
    }
}
