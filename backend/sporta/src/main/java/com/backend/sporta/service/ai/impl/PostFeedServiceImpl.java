package com.backend.sporta.service.ai.impl;

import com.backend.sporta.entity.*;
import com.backend.sporta.enums.MatchStatus;
import com.backend.sporta.enums.ParticipantStatus;
import com.backend.sporta.enums.Role;
import com.backend.sporta.exception.CustomException;
import com.backend.sporta.repository.*;
import com.backend.sporta.service.ai.InMemoryCache;
import com.backend.sporta.service.ai.PostFeedService;
import com.backend.sporta.service.ai.PostRankingEngine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PostFeedServiceImpl implements PostFeedService {

    private final PostRepository postRepository;
    private final PostParticipantRepository postParticipantRepository;
    private final PostReactionRepository postReactionRepository;
    private final PostCommentRepository postCommentRepository;
    private final UserRepository userRepository;
    private final VenueRepository venueRepository;
    private final VoucherRepository voucherRepository;
    private final UserSportRepository userSportRepository;
    private final ClubMemberRepository clubMemberRepository;
    private final com.backend.sporta.repository.ClubRepository clubRepository;
    private final BookingRepository bookingRepository;
    private final UserHiddenPostRepository userHiddenPostRepository;
    private final MatchRoomRepository matchRoomRepository;
    private final PostRankingEngine rankingEngine;
    private final InMemoryCache cache;

    private static final String SNAPSHOT_PREFIX = "feed_snapshot:";
    private static final long SNAPSHOT_TTL_MINUTES = 10;
    private static final String RATE_LIMIT_PREFIX = "rate_limit:post:";

    @Override
    @Transactional(readOnly = true)
    public Page<Map<String, Object>> getFeed(
            Long currentUserId,
            String tab,
            String sportTag,
            Double latitude,
            Double longitude,
            int page,
            int size
    ) {
        String activeTab = (tab != null && !tab.isBlank()) ? tab.toUpperCase() : "FOR_YOU";
        Pageable pageable = PageRequest.of(page, Math.max(1, size));

        // Get user's hidden post IDs to exclude from feed
        Set<Long> hiddenPostIds = (currentUserId != null)
                ? userHiddenPostRepository.findByUserId(currentUserId).stream()
                    .map(h -> h.getPost().getId())
                    .collect(Collectors.toSet())
                : Collections.emptySet();

        // Get user's approved joined club IDs
        List<Long> joinedClubIds = (currentUserId != null)
                ? clubMemberRepository.findByUserId(currentUserId).stream()
                    .filter(cm -> cm.getStatus() == com.backend.sporta.enums.ClubMemberStatus.APPROVED)
                    .map(cm -> cm.getClub().getId())
                    .collect(Collectors.toList())
                : Collections.emptyList();

        // 1. Tab LATEST: Phân trang trực tiếp thuần túy theo createdAt DESC
        if ("LATEST".equalsIgnoreCase(activeTab)) {
            Page<Post> postsPage = postRepository.findByIsDeletedFalseOrderByCreatedAtDesc(pageable);
            List<Post> filteredPosts = postsPage.getContent().stream()
                    .filter(p -> !hiddenPostIds.contains(p.getId()))
                    .filter(p -> isPostVisibleToUser(p, currentUserId, joinedClubIds))
                    .collect(Collectors.toList());
            return enrichPostsToResponse(filteredPosts, currentUserId, postsPage.getTotalElements(), pageable, null);
        }

        // 2. Tab FOR_YOU / MATCH_FINDING / CLUBS: Smart Ranking với Redis Snapshot Pagination
        String snapshotKey = SNAPSHOT_PREFIX + (currentUserId != null ? currentUserId : "anon") + ":" + activeTab + ":" + (sportTag != null ? sportTag : "all");
        List<Long> rankedPostIds = (List<Long>) cache.get(snapshotKey);

        if (rankedPostIds == null || page == 0) {
            // Recompute ranking for candidates in the last 14 days
            LocalDateTime since = LocalDateTime.now().minusDays(14);
            List<Post> candidates;

            if ("MATCH_FINDING".equalsIgnoreCase(activeTab)) {
                candidates = postRepository.findCandidatePostsByTypeAndSince("MATCH_FINDING", since);
            } else if ("CLUBS".equalsIgnoreCase(activeTab)) {
                // Tab CLUBS: ONLY show posts for clubs the user is an APPROVED member of
                if (joinedClubIds.isEmpty()) {
                    candidates = Collections.emptyList();
                } else {
                    candidates = postRepository.findCandidatePostsSince(since).stream()
                            .filter(p -> p.getClub() != null && joinedClubIds.contains(p.getClub().getId()))
                            .collect(Collectors.toList());
                }
            } else {
                candidates = postRepository.findCandidatePostsSince(since);
            }

            // Filter out hidden posts and internal club posts where user is not a member
            if (!candidates.isEmpty()) {
                candidates = candidates.stream()
                        .filter(p -> !hiddenPostIds.contains(p.getId()))
                        .filter(p -> isPostVisibleToUser(p, currentUserId, joinedClubIds))
                        .collect(Collectors.toList());
            }

            // Optional sportTag filtering
            if (sportTag != null && !sportTag.isBlank() && !"ALL".equalsIgnoreCase(sportTag)) {
                String normSport = normalizeString(sportTag);
                candidates = candidates.stream()
                        .filter(p -> p.getSportName() != null && normalizeString(p.getSportName()).contains(normSport))
                        .collect(Collectors.toList());
            }

            // Build User Context
            PostRankingEngine.UserFeedContext userContext = buildUserFeedContext(currentUserId, latitude, longitude);
            LocalDateTime now = LocalDateTime.now();

            // Chấm điểm từng candidate
            List<PostRankingEngine.ScoredPost> scoredPosts = new ArrayList<>();
            for (Post p : candidates) {
                PostRankingEngine.ScoredPost scored = rankingEngine.scorePost(p, userContext, now);
                // Filter out severely negative scores (expired matches or invalid)
                if (scored.getTotalScore() > -900.0) {
                    scoredPosts.add(scored);
                }
            }

            // Sắp xếp giảm dần theo điểm
            scoredPosts.sort((a, b) -> Double.compare(b.getTotalScore(), a.getTotalScore()));

            // Áp dụng thuật toán Đa dạng hóa (Diversity Sliding Window)
            List<PostRankingEngine.ScoredPost> diversifiedPosts = applyDiversityFilter(scoredPosts, activeTab);

            // Lưu danh sách Top 100 Post IDs vào Snapshot Cache
            rankedPostIds = diversifiedPosts.stream()
                    .map(sp -> sp.getPost().getId())
                    .limit(100)
                    .collect(Collectors.toList());

            cache.put(snapshotKey, rankedPostIds, SNAPSHOT_TTL_MINUTES, TimeUnit.MINUTES);
        }

        // Cắt lát phân trang từ Snapshot IDs
        int totalElements = rankedPostIds.size();
        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, totalElements);

        if (fromIndex >= totalElements) {
            return new PageImpl<>(Collections.emptyList(), pageable, totalElements);
        }

        List<Long> pagePostIds = rankedPostIds.subList(fromIndex, toIndex);

        // Hydrate thực thể từ DB
        List<Post> hydratedPosts = postRepository.findAllByIdInWithDetails(pagePostIds);

        // Tombstone Filtering: Lọc bỏ bài đã bị xóa (isDeleted = true) hoặc hết hạn nếu là tab MATCH_FINDING
        LocalDateTime currentDateTime = LocalDateTime.now();
        hydratedPosts = hydratedPosts.stream()
                .filter(p -> p.getIsDeleted() == null || !p.getIsDeleted())
                .filter(p -> {
                    if ("MATCH_FINDING".equalsIgnoreCase(activeTab)) {
                        if (p.getMatchStatus() == MatchStatus.EXPIRED || p.getMatchStatus() == MatchStatus.CANCELLED) {
                            return false;
                        }
                        if (p.getPlayDate() != null && p.getEndTime() != null) {
                            LocalDateTime matchEnd = LocalDateTime.of(p.getPlayDate(), p.getEndTime());
                            return !currentDateTime.isAfter(matchEnd);
                        }
                    }
                    return true;
                })
                .collect(Collectors.toList());

        // Giữ nguyên thứ tự Rank từ Snapshot
        Map<Long, Post> postMap = hydratedPosts.stream().collect(Collectors.toMap(Post::getId, p -> p, (a, b) -> a));
        List<Post> orderedPosts = new ArrayList<>();
        for (Long id : pagePostIds) {
            if (postMap.containsKey(id)) {
                orderedPosts.add(postMap.get(id));
            }
        }

        return enrichPostsToResponse(orderedPosts, currentUserId, totalElements, pageable, null);
    }

    /**
     * Tham gia vào bài viết ghép kèo (Có khóa bi quan Pessimistic Lock)
     */
    @Override
    @Transactional
    public Map<String, Object> joinMatchSlot(Long postId, Long currentUserId) {
        if (currentUserId == null) {
            throw new CustomException("Vui lòng đăng nhập để tham gia ghép kèo", 401);
        }

        // 1. Khóa row bài viết Pessimistic Write Lock
        Post post = postRepository.findByIdWithLock(postId)
                .orElseThrow(() -> new CustomException("Không tìm thấy bài viết ghép kèo", 404));

        if (!"MATCH_FINDING".equalsIgnoreCase(post.getType())) {
            throw new CustomException("Bài viết này không phải bài ghép kèo", 400);
        }

        if (post.getAuthor().getId().equals(currentUserId)) {
            throw new CustomException("Bạn là người tạo kèo này rồi", 400);
        }

        if (post.getMatchStatus() != null && post.getMatchStatus() != MatchStatus.OPEN) {
            throw new CustomException("Kèo đấu này hiện không còn nhận thành viên", 400);
        }

        // Kiểm tra thời gian kết thúc kèo
        if (post.getPlayDate() != null && post.getEndTime() != null) {
            LocalDateTime matchEnd = LocalDateTime.of(post.getPlayDate(), post.getEndTime());
            if (LocalDateTime.now().isAfter(matchEnd)) {
                post.setMatchStatus(MatchStatus.EXPIRED);
                postRepository.save(post);
                throw new CustomException("Kèo đấu này đã quá thời gian diễn ra", 400);
            }
        }

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin người dùng", 404));

        // 2. Kiểm tra đã tham gia chưa
        Optional<PostParticipant> existingParticipant = postParticipantRepository.findByPostIdAndUserId(postId, currentUserId);
        if (existingParticipant.isPresent() && existingParticipant.get().getStatus() == ParticipantStatus.JOINED) {
            throw new CustomException("Bạn đã tham gia kèo này rồi", 400);
        }

        // 3. Kiểm tra số lượng slot
        int slotsNeeded = post.getSlotsNeeded() != null ? post.getSlotsNeeded() : 0;
        int currentSlots = post.getCurrentSlots() != null ? post.getCurrentSlots() : 0;

        if (slotsNeeded > 0 && currentSlots >= slotsNeeded) {
            post.setMatchStatus(MatchStatus.FULL);
            postRepository.save(post);
            throw new CustomException("Rất tiếc, kèo đấu đã vừa đủ người tham gia", 409);
        }

        // 4. Ghi nhận tham gia
        PostParticipant participant;
        if (existingParticipant.isPresent()) {
            participant = existingParticipant.get();
            participant.setStatus(ParticipantStatus.JOINED);
            participant.setJoinedAt(LocalDateTime.now());
            participant.setCancelledAt(null);
        } else {
            participant = PostParticipant.builder()
                    .post(post)
                    .user(user)
                    .status(ParticipantStatus.JOINED)
                    .joinedAt(LocalDateTime.now())
                    .build();
        }
        postParticipantRepository.save(participant);

        // 5. Cập nhật currentSlots & chuyển FULL nếu đủ
        int newCurrentSlots = currentSlots + 1;
        post.setCurrentSlots(newCurrentSlots);
        if (slotsNeeded > 0 && newCurrentSlots >= slotsNeeded) {
            post.setMatchStatus(MatchStatus.FULL);
        }
        postRepository.save(post);

        log.info("[MATCH JOIN SUCCESS] User {} joined post {} (Slots: {}/{})", currentUserId, postId, newCurrentSlots, slotsNeeded);

        return Map.of(
                "success", true,
                "message", "Ghép kèo thành công! Hãy sẵn sàng cho trận đấu nhé.",
                "currentSlots", newCurrentSlots,
                "slotsNeeded", slotsNeeded,
                "matchStatus", post.getMatchStatus().name()
        );
    }

    /**
     * Rời khỏi kèo đấu
     */
    @Override
    @Transactional
    public Map<String, Object> leaveMatchSlot(Long postId, Long currentUserId) {
        if (currentUserId == null) {
            throw new CustomException("Vui lòng đăng nhập", 401);
        }

        Post post = postRepository.findByIdWithLock(postId)
                .orElseThrow(() -> new CustomException("Không tìm thấy bài viết", 404));

        PostParticipant participant = postParticipantRepository.findByPostIdAndUserId(postId, currentUserId)
                .orElseThrow(() -> new CustomException("Bạn chưa tham gia kèo này", 400));

        if (participant.getStatus() == ParticipantStatus.CANCELLED) {
            throw new CustomException("Bạn đã rời khỏi kèo này trước đó", 400);
        }

        participant.setStatus(ParticipantStatus.CANCELLED);
        participant.setCancelledAt(LocalDateTime.now());
        postParticipantRepository.save(participant);

        int currentSlots = Math.max(0, (post.getCurrentSlots() != null ? post.getCurrentSlots() : 1) - 1);
        post.setCurrentSlots(currentSlots);

        if (post.getMatchStatus() == MatchStatus.FULL) {
            post.setMatchStatus(MatchStatus.OPEN);
        }
        postRepository.save(post);

        log.info("[MATCH LEAVE SUCCESS] User {} left post {} (Slots: {}/{})", currentUserId, postId, currentSlots, post.getSlotsNeeded());

        return Map.of(
                "success", true,
                "message", "Đã rời khỏi kèo thành công.",
                "currentSlots", currentSlots,
                "slotsNeeded", post.getSlotsNeeded() != null ? post.getSlotsNeeded() : 0,
                "matchStatus", post.getMatchStatus().name()
        );
    }

    /**
     * Lấy danh sách thành viên đã tham gia kèo
     */
    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPostParticipants(Long postId) {
        List<PostParticipant> participants = postParticipantRepository.findByPostIdAndStatusWithUser(postId, ParticipantStatus.JOINED);
        List<Map<String, Object>> result = new ArrayList<>();

        for (PostParticipant p : participants) {
            User u = p.getUser();
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("fullName", u.getFullName() != null ? u.getFullName() : "Người dùng");
            map.put("avatarUrl", u.getAvatarUrl());
            map.put("joinedAt", p.getJoinedAt());
            result.add(map);
        }
        return result;
    }

    /**
     * Tạo bài viết với kiểm tra phân quyền bảo mật & rate limiting
     */
    @Override
    @Transactional
    public Post createPostWithSecurity(Map<String, Object> payload, Long currentUserId) {
        if (currentUserId == null) {
            throw new CustomException("Vui lòng đăng nhập để đăng bài", 401);
        }

        User author = userRepository.findById(currentUserId)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin tài khoản", 404));

        String type = (String) payload.getOrDefault("type", "COMMUNITY");
        String content = (String) payload.getOrDefault("content", "");
        @SuppressWarnings("unchecked")
        List<String> mediaUrls = (List<String>) payload.getOrDefault("mediaUrls", Collections.emptyList());
        String audience = (String) payload.getOrDefault("audience", "PUBLIC");

        // 1. Rate Limiting Check
        String rateLimitKey = RATE_LIMIT_PREFIX + currentUserId;
        Long postCountInWindow = cache.increment(rateLimitKey, 10, TimeUnit.MINUTES);
        if (postCountInWindow != null && postCountInWindow > 5) {
            throw new CustomException("Bạn đang đăng bài quá nhanh. Vui lòng chờ vài phút rồi thử lại nhé!", 429);
        }

        // 2. Bảo mật & Ownership Guard cho VENUE_PROMO
        Venue venue = null;
        Voucher voucher = null;

        if ("VENUE_PROMO".equalsIgnoreCase(type)) {
            if (author.getRole() != Role.OWNER && author.getRole() != Role.ADMIN) {
                throw new CustomException("Chỉ chủ sân (Venue Owner) mới có quyền đăng bài khuyến mãi sân bãi", 403);
            }

            Object venueIdObj = payload.get("venueId");
            if (venueIdObj == null) {
                throw new CustomException("Vui lòng chọn cụm sân áp dụng khuyến mãi", 400);
            }

            UUID venueUuid;
            try {
                venueUuid = UUID.fromString(venueIdObj.toString());
            } catch (Exception e) {
                throw new CustomException("ID sân không hợp lệ", 400);
            }

            venue = venueRepository.findById(venueUuid)
                    .orElseThrow(() -> new CustomException("Không tìm thấy cụm sân được chỉ định", 404));

            // Verify owner owns this venue
            if (venue.getOwner() == null || venue.getOwner().getUser() == null ||
                !venue.getOwner().getUser().getId().equals(currentUserId)) {
                throw new CustomException("Bạn không có quyền quản lý cụm sân này", 403);
            }

            // Verify voucher if provided
            Object voucherIdObj = payload.get("voucherId");
            if (voucherIdObj != null) {
                try {
                    UUID voucherUuid = UUID.fromString(voucherIdObj.toString());
                    voucher = voucherRepository.findById(voucherUuid).orElse(null);
                    if (voucher != null && voucher.getOwner() != null && venue.getOwner() != null) {
                        if (!voucher.getOwner().getId().equals(venue.getOwner().getId())) {
                            throw new CustomException("Mã voucher không thuộc quyền quản lý của sân này", 403);
                        }
                    }
                } catch (Exception ignored) {}
            }
        }

        // Parse Match Finding fields
        LocalDate playDate = null;
        LocalTime startTime = null;
        LocalTime endTime = null;
        Integer slotsNeeded = 0;
        Double memberFeeAmount = null;

        if ("MATCH_FINDING".equalsIgnoreCase(type)) {
            if (payload.get("playDate") != null) {
                playDate = parseFlexibleDate(payload.get("playDate").toString());
            }
            if (playDate == null) {
                playDate = LocalDate.now();
            }

            if (payload.get("startTime") != null) {
                startTime = parseFlexibleTime(payload.get("startTime").toString());
            }
            if (startTime == null) {
                startTime = LocalTime.of(19, 30);
            }

            if (payload.get("endTime") != null) {
                endTime = parseFlexibleTime(payload.get("endTime").toString());
            }
            if (endTime == null) {
                endTime = startTime.plusHours(2);
            }

            if (payload.get("slotsNeeded") != null) {
                try {
                    slotsNeeded = Integer.parseInt(payload.get("slotsNeeded").toString());
                } catch (Exception ignored) {}
            }
            if (slotsNeeded == null || slotsNeeded <= 0) {
                slotsNeeded = 1;
            }

            if (payload.get("memberFeeAmount") != null) {
                try {
                    memberFeeAmount = Double.parseDouble(payload.get("memberFeeAmount").toString());
                } catch (Exception ignored) {}
            }
            // Optional venue lookup for match finding
            if (payload.get("venueId") != null) {
                try {
                    UUID venueUuid = UUID.fromString(payload.get("venueId").toString());
                    venue = venueRepository.findById(venueUuid).orElse(null);
                } catch (Exception ignored) {}
            }
            if (venue == null && payload.get("matchRoomId") != null) {
                try {
                    UUID roomId = UUID.fromString(payload.get("matchRoomId").toString());
                    MatchRoom room = matchRoomRepository.findById(roomId).orElse(null);
                    if (room != null && room.getBooking() != null && room.getBooking().getVenue() != null) {
                        venue = room.getBooking().getVenue();
                    }
                } catch (Exception ignored) {}
            }
        }

        // Parse Club association if present
        com.backend.sporta.entity.Club club = null;
        Long clubId = null;
        if (payload.get("clubId") != null) {
            try {
                clubId = ((Number) payload.get("clubId")).longValue();
            } catch (Exception ignored) {}
        } else if (payload.get("clubInfo") instanceof Map) {
            Object cIdObj = ((Map<?, ?>) payload.get("clubInfo")).get("id");
            if (cIdObj instanceof Number) {
                clubId = ((Number) cIdObj).longValue();
            } else if (cIdObj instanceof String) {
                try {
                    clubId = Long.parseLong(((String) cIdObj).replace("club-", ""));
                } catch (Exception ignored) {}
            }
        }

        if (clubId != null) {
            club = clubRepository.findById(clubId).orElse(null);
            if (club != null) {
                audience = "CLUB_MEMBERS";
            }
        }

        String matchRoomId = payload.get("matchRoomId") != null ? String.valueOf(payload.get("matchRoomId")) : null;

        // 3. Cơ chế Cooldown Lock (30 phút) cho cùng 1 matchRoomId để chống spam
        if ("MATCH_FINDING".equalsIgnoreCase(type) && matchRoomId != null && !matchRoomId.isBlank()) {
            Optional<Post> existingPostOpt = postRepository.findFirstByMatchRoomIdAndIsDeletedFalseOrderByCreatedAtDesc(matchRoomId);
            if (existingPostOpt.isPresent()) {
                Post existing = existingPostOpt.get();
                if (existing.getCreatedAt() != null) {
                    LocalDateTime cooldownEnd = existing.getCreatedAt().plusMinutes(30);
                    if (LocalDateTime.now().isBefore(cooldownEnd)) {
                        long remainingMinutes = java.time.Duration.between(LocalDateTime.now(), cooldownEnd).toMinutes() + 1;
                        throw new CustomException("Kèo này vừa được chia sẻ lên bảng tin gần đây. Bạn có thể đăng lại sau " + remainingMinutes + " phút nữa.", 429);
                    }
                }
            }
        }

        Object bgGradObj = payload.get("backgroundGradient");
        String backgroundGradientStr = null;
        if (bgGradObj instanceof List) {
            backgroundGradientStr = String.join(",", (List<String>) bgGradObj);
        } else if (bgGradObj instanceof String) {
            backgroundGradientStr = (String) bgGradObj;
        }
        String backgroundId = payload.get("backgroundId") != null ? String.valueOf(payload.get("backgroundId")) : null;

        Long totalPrice = null;
        if (payload.get("totalPrice") instanceof Number) {
            totalPrice = ((Number) payload.get("totalPrice")).longValue();
        } else if (payload.get("totalFee") instanceof Number) {
            totalPrice = ((Number) payload.get("totalFee")).longValue();
        }

        Post newPost = Post.builder()
                .author(author)
                .content(content)
                .mediaUrls(mediaUrls != null ? mediaUrls : Collections.emptyList())
                .backgroundGradient(backgroundGradientStr)
                .backgroundId(backgroundId)
                .type(type)
                .audience(audience)
                .club(club)
                .matchRoomId(matchRoomId)
                .venue(venue)
                .sportName((String) payload.get("sportName"))
                .venueName((String) payload.get("venueName"))
                .timeSlot((String) payload.get("timeSlot"))
                .memberFee((String) payload.get("memberFee"))
                .playDate(playDate)
                .startTime(startTime)
                .endTime(endTime)
                .targetLevel((String) payload.get("targetLevel"))
                .slotsNeeded(slotsNeeded)
                .currentSlots(0)
                .matchStatus("MATCH_FINDING".equalsIgnoreCase(type) ? MatchStatus.OPEN : null)
                .memberFeeAmount(memberFeeAmount)
                .totalPrice(totalPrice)
                .note((String) payload.get("note"))
                .currency((String) payload.getOrDefault("currency", "VND"))
                .promoTitle((String) payload.get("promoTitle"))
                .promoCode((String) payload.get("promoCode"))
                .discountText((String) payload.get("discountText"))
                .voucher(voucher)
                .likeCount(0)
                .commentCount(0)
                .shareCount(0)
                .createdAt(LocalDateTime.now())
                .build();

        return postRepository.save(newPost);
    }

    /**
     * Thuật toán Đa dạng hóa (Diversity Sliding Window)
     */
    private List<PostRankingEngine.ScoredPost> applyDiversityFilter(List<PostRankingEngine.ScoredPost> rankedPosts, String tab) {
        if (rankedPosts == null || rankedPosts.size() <= 2) {
            return rankedPosts != null ? rankedPosts : Collections.emptyList();
        }

        List<PostRankingEngine.ScoredPost> result = new ArrayList<>(rankedPosts);

        // 1. Author Spacing: Không cho phép quá 2 bài liên tiếp của cùng 1 tác giả
        for (int i = 2; i < result.size(); i++) {
            Long currentAuthorId = result.get(i).getPost().getAuthor().getId();
            Long prevAuthorId1 = result.get(i - 1).getPost().getAuthor().getId();
            Long prevAuthorId2 = result.get(i - 2).getPost().getAuthor().getId();

            if (currentAuthorId.equals(prevAuthorId1) && currentAuthorId.equals(prevAuthorId2)) {
                // Tìm bài viết đầu tiên phía sau khác tác giả để swap
                for (int j = i + 1; j < result.size(); j++) {
                    if (!result.get(j).getPost().getAuthor().getId().equals(currentAuthorId)) {
                        PostRankingEngine.ScoredPost temp = result.get(i);
                        result.set(i, result.get(j));
                        result.set(j, temp);
                        break;
                    }
                }
            }
        }

        // 2. Promo Spacing: Trong tab FOR_YOU, tối thiểu 3 bài thường/kèo mới có 1 bài VENUE_PROMO
        if ("FOR_YOU".equalsIgnoreCase(tab)) {
            int normalCountSinceLastPromo = 3;
            for (int i = 0; i < result.size(); i++) {
                boolean isPromo = "VENUE_PROMO".equalsIgnoreCase(result.get(i).getPost().getType());
                if (isPromo) {
                    if (normalCountSinceLastPromo < 3) {
                        // Đẩy bài promo này xuống sau
                        for (int j = i + 1; j < result.size(); j++) {
                            if (!"VENUE_PROMO".equalsIgnoreCase(result.get(j).getPost().getType())) {
                                PostRankingEngine.ScoredPost temp = result.get(i);
                                result.set(i, result.get(j));
                                result.set(j, temp);
                                break;
                            }
                        }
                    }
                    normalCountSinceLastPromo = 0;
                } else {
                    normalCountSinceLastPromo++;
                }
            }
        }

        return result;
    }

    private PostRankingEngine.UserFeedContext buildUserFeedContext(Long userId, Double lat, Double lng) {
        if (userId == null) {
            return PostRankingEngine.UserFeedContext.builder()
                    .latitude(lat)
                    .longitude(lng)
                    .build();
        }

        Set<String> favoriteSports = new HashSet<>();
        List<UserSport> userSports = userSportRepository.findByUserId(userId);
        Integer skillRank = 3;

        for (UserSport us : userSports) {
            if (us.getSport() != null && us.getSport().getName() != null) {
                favoriteSports.add(us.getSport().getName());
            }
            if (us.getLevel() != null) {
                skillRank = rankingEngine.mapLevelToRank(us.getLevel().name());
            }
        }

        // Club members
        Set<Long> clubMemberUserIds = new HashSet<>();
        List<ClubMember> myClubs = clubMemberRepository.findByUserId(userId);
        for (ClubMember cm : myClubs) {
            if (cm.getClub() != null) {
                List<ClubMember> peers = clubMemberRepository.findByClubId(cm.getClub().getId());
                for (ClubMember peer : peers) {
                    if (peer.getUser() != null) {
                        clubMemberUserIds.add(peer.getUser().getId());
                    }
                }
            }
        }

        // Booked venues
        Set<UUID> bookedVenueIds = new HashSet<>();
        List<Booking> myBookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (Booking b : myBookings) {
            if (b.getVenue() != null) {
                bookedVenueIds.add(b.getVenue().getId());
            }
        }

        return PostRankingEngine.UserFeedContext.builder()
                .userId(userId)
                .latitude(lat)
                .longitude(lng)
                .favoriteSports(favoriteSports)
                .clubMemberUserIds(clubMemberUserIds)
                .bookedVenueIds(bookedVenueIds)
                .userSkillRank(skillRank)
                .build();
    }

    private Page<Map<String, Object>> enrichPostsToResponse(
            List<Post> posts,
            Long currentUserId,
            long totalElements,
            Pageable pageable,
            Map<Long, Double> scoreMap
    ) {
        if (posts.isEmpty()) {
            return new PageImpl<>(Collections.emptyList(), pageable, totalElements);
        }

        List<Long> postIds = posts.stream().map(Post::getId).collect(Collectors.toList());

        // 1. Reactions of current user
        Map<Long, String> userReactions = new HashMap<>();
        if (currentUserId != null) {
            List<PostReaction> reactions = postReactionRepository.findByPostIdInAndUserId(postIds, currentUserId);
            for (PostReaction r : reactions) {
                userReactions.put(r.getPost().getId(), r.getReactionType());
            }
        }

        // 2. Reaction counts per post & type
        Map<Long, Map<String, Long>> postReactionCounts = new HashMap<>();
        List<Object[]> rawCounts = postReactionRepository.countByPostIdsGroupedByType(postIds);
        for (Object[] row : rawCounts) {
            Long postId = ((Number) row[0]).longValue();
            String type = (String) row[1];
            Long count = ((Number) row[2]).longValue();
            postReactionCounts.computeIfAbsent(postId, k -> new HashMap<>()).put(type, count);
        }

        // 3. Joined match posts for current user
        Set<Long> joinedPostIds = new HashSet<>();
        if (currentUserId != null) {
            List<Long> joinedList = postParticipantRepository.findJoinedPostIdsByUserAndPostIdIn(currentUserId, postIds);
            joinedPostIds.addAll(joinedList);
        }

        // 4. Map DTO
        List<Map<String, Object>> responseList = posts.stream().map(post -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", post.getId());
            map.put("author", post.getAuthor());
            map.put("content", post.getContent());
            map.put("mediaUrls", post.getMediaUrls());
            if (post.getBackgroundGradient() != null && !post.getBackgroundGradient().isBlank()) {
                map.put("backgroundGradient", Arrays.asList(post.getBackgroundGradient().split(",")));
            } else {
                map.put("backgroundGradient", null);
            }
            map.put("backgroundId", post.getBackgroundId());
            map.put("type", post.getType());
            map.put("audience", post.getAudience());
            try {
                if (post.getClub() != null) {
                    map.put("clubInfo", Map.of(
                            "id", post.getClub().getId(),
                            "name", post.getClub().getName() != null ? post.getClub().getName() : "CLB Sporta",
                            "avatarUrl", post.getClub().getAvatarImage() != null ? post.getClub().getAvatarImage() : ""
                    ));
                }
            } catch (Exception e) {
                log.warn("Could not load club info for post {}: {}", post.getId(), e.getMessage());
            }
            map.put("matchRoomId", post.getMatchRoomId());
            map.put("sportName", post.getSportName());
            Venue postVenue = null;
            String postVenueId = null;
            try {
                postVenue = post.getVenue();
                if (postVenue != null) {
                    postVenueId = postVenue.getId().toString();
                } else if (post.getMatchRoomId() != null) {
                    try {
                        UUID roomId = UUID.fromString(post.getMatchRoomId());
                        MatchRoom mr = matchRoomRepository.findById(roomId).orElse(null);
                        if (mr != null && mr.getBooking() != null && mr.getBooking().getVenue() != null) {
                            postVenue = mr.getBooking().getVenue();
                            postVenueId = postVenue.getId().toString();
                        }
                    } catch (Exception ignored) {}
                }
                if (postVenueId == null) {
                    List<Venue> allVenues = venueRepository.findAll();
                    if (!allVenues.isEmpty()) {
                        if (post.getVenueName() != null) {
                            String vName = post.getVenueName().toLowerCase();
                            postVenue = allVenues.stream()
                                    .filter(v -> vName.contains(v.getName().toLowerCase()) || v.getName().toLowerCase().contains(vName.split(" - ")[0].toLowerCase()))
                                    .findFirst()
                                    .orElse(allVenues.get(0));
                        } else {
                            postVenue = allVenues.get(0);
                        }
                        if (postVenue != null) {
                            postVenueId = postVenue.getId().toString();
                        }
                    }
                }
                map.put("venue", postVenue);
                map.put("venueId", postVenueId);
            } catch (Exception e) {
                map.put("venue", null);
                map.put("venueId", null);
                log.warn("Could not load venue for post {}: {}", post.getId(), e.getMessage());
            }
            map.put("timeSlot", post.getTimeSlot());
            map.put("playDate", post.getPlayDate());
            map.put("startTime", post.getStartTime());
            map.put("endTime", post.getEndTime());
            map.put("targetLevel", post.getTargetLevel());
            String matchStatusStr = post.getMatchStatus() != null ? post.getMatchStatus().name() : "OPEN";
            String guestClubName = null;
            String guestClubAvatar = null;
            if (post.getMatchRoomId() != null) {
                try {
                    UUID roomUuid = UUID.fromString(post.getMatchRoomId());
                    var roomOpt = matchRoomRepository.findById(roomUuid);
                    if (roomOpt.isPresent()) {
                        var room = roomOpt.get();
                        if (room.getStatus() != null) {
                            matchStatusStr = room.getStatus().name();
                        }
                        if (room.getGuestClub() != null) {
                            guestClubName = room.getGuestClub().getName();
                            guestClubAvatar = room.getGuestClub().getAvatarImage();
                        }
                    }
                } catch (Exception ignored) {}
            }
            map.put("slotsNeeded", post.getSlotsNeeded() != null ? post.getSlotsNeeded() : 0);
            map.put("currentSlots", post.getCurrentSlots() != null ? post.getCurrentSlots() : 0);
            map.put("matchStatus", matchStatusStr);
            map.put("guestClubName", guestClubName);
            map.put("guestClubAvatar", guestClubAvatar);
            map.put("isJoined", joinedPostIds.contains(post.getId()));
            map.put("memberFee", post.getMemberFee());
            map.put("memberFeeAmount", post.getMemberFeeAmount());
            map.put("totalPrice", post.getTotalPrice());
            map.put("note", post.getNote());
            map.put("currency", post.getCurrency() != null ? post.getCurrency() : "VND");
            map.put("promoTitle", post.getPromoTitle());
            map.put("promoCode", post.getPromoCode());
            map.put("discountText", post.getDiscountText());
            map.put("voucher", post.getVoucher());
            map.put("validUntil", post.getValidUntil());
            map.put("likeCount", post.getLikeCount() != null ? post.getLikeCount() : 0);
            map.put("commentCount", post.getCommentCount() != null ? post.getCommentCount() : 0);
            map.put("shareCount", post.getShareCount() != null ? post.getShareCount() : 0);
            map.put("createdAt", post.getCreatedAt());

            // Attach per-type reaction counts
            Map<String, Long> countsForPost = postReactionCounts.getOrDefault(post.getId(), Collections.emptyMap());
            Map<String, Long> reactionsCount = new HashMap<>();
            for (String key : new String[]{"like", "love", "fire", "clap", "muscle", "trophy"}) {
                reactionsCount.put(key, countsForPost.getOrDefault(key, 0L));
            }
            map.put("reactionsCount", reactionsCount);

            if (currentUserId != null && userReactions.containsKey(post.getId())) {
                map.put("userReaction", userReactions.get(post.getId()));
            }

            if (scoreMap != null && scoreMap.containsKey(post.getId())) {
                map.put("rankingScore", scoreMap.get(post.getId()));
            }

            return map;
        }).collect(Collectors.toList());

        return new PageImpl<>(responseList, pageable, totalElements);
    }

    private String normalizeString(String input) {
        if (input == null) return "";
        return java.text.Normalizer.normalize(input, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .toLowerCase()
                .trim();
    }

    private LocalDate parseFlexibleDate(String input) {
        if (input == null || input.isBlank()) return null;
        String clean = input.trim();
        try {
            return LocalDate.parse(clean);
        } catch (Exception ignored) {}
        try {
            String[] parts = clean.split("[/\\-\\.]");
            if (parts.length == 3) {
                if (parts[0].length() == 4) {
                    return LocalDate.of(Integer.parseInt(parts[0]), Integer.parseInt(parts[1]), Integer.parseInt(parts[2]));
                } else if (parts[2].length() == 4) {
                    return LocalDate.of(Integer.parseInt(parts[2]), Integer.parseInt(parts[1]), Integer.parseInt(parts[0]));
                }
            }
        } catch (Exception ignored) {}
        return null;
    }

    private LocalTime parseFlexibleTime(String input) {
        if (input == null || input.isBlank()) return null;
        String clean = input.trim();
        try {
            return LocalTime.parse(clean);
        } catch (Exception ignored) {}
        try {
            String[] parts = clean.split(":");
            if (parts.length >= 2) {
                int hour = Integer.parseInt(parts[0]);
                int minute = Integer.parseInt(parts[1]);
                return LocalTime.of(hour, minute);
            }
        } catch (Exception ignored) {}
        return null;
    }

    private boolean isPostVisibleToUser(Post p, Long currentUserId, List<Long> joinedClubIds) {
        if (p == null || (p.getIsDeleted() != null && p.getIsDeleted())) {
            return false;
        }

        // Check if post audience is restricted to a Club
        boolean isInternalClub = "CLUB".equalsIgnoreCase(p.getAudience()) || "CLUB_MEMBERS".equalsIgnoreCase(p.getAudience());
        if (isInternalClub) {
            // Author can always see their own post
            if (currentUserId != null && p.getAuthor() != null && p.getAuthor().getId().equals(currentUserId)) {
                return true;
            }
            // Must belong to a club and current user must be an approved member of that club
            if (p.getClub() != null && joinedClubIds.contains(p.getClub().getId())) {
                return true;
            }
            return false;
        }

        return true;
    }

    @Override
    public void clearFeedCache(Long userId) {
        if (userId != null) {
            cache.removeByPrefix(SNAPSHOT_PREFIX + userId + ":");
        } else {
            cache.removeByPrefix(SNAPSHOT_PREFIX);
        }
    }
}
