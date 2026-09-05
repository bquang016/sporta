package com.backend.sporta.controller;

import com.backend.sporta.entity.Post;
import com.backend.sporta.entity.PostComment;
import com.backend.sporta.entity.PostReaction;
import com.backend.sporta.entity.User;
import com.backend.sporta.enums.NotificationType;
import com.backend.sporta.enums.Role;
import com.backend.sporta.repository.PostCommentRepository;
import com.backend.sporta.repository.PostReactionRepository;
import com.backend.sporta.repository.PostRepository;
import com.backend.sporta.repository.UserRepository;
import com.backend.sporta.security.JwtTokenProvider;
import com.backend.sporta.service.NotificationService;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/posts")
@CrossOrigin(origins = "*")
public class PostController {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostReactionRepository postReactionRepository;

    @Autowired
    private PostCommentRepository postCommentRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private com.backend.sporta.service.ai.PostFeedService postFeedService;

    @Autowired
    private com.backend.sporta.repository.UserHiddenPostRepository userHiddenPostRepository;

    @Autowired
    private NotificationService notificationService;

    private Long getUserIdFromHeader(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtTokenProvider.validateToken(token)) {
                Claims claims = jwtTokenProvider.getClaimsFromToken(token);
                Number userIdNum = claims.get("userId", Number.class);
                if (userIdNum != null) {
                    return userIdNum.longValue();
                }
                String email = claims.getSubject();
                if (email != null) {
                    User u = userRepository.findByEmail(email).orElse(null);
                    if (u != null) return u.getId();
                }
            }
        }
        return null;
    }

    /**
     * Bảng tin thông minh đa chiều (Smart Multidimensional Feed)
     */
    @GetMapping("/feed")
    public ResponseEntity<?> getSmartFeed(
            @RequestParam(defaultValue = "FOR_YOU") String tab,
            @RequestParam(required = false) String sportTag,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        Long currentUserId = getUserIdFromHeader(authHeader);
        Page<Map<String, Object>> feedPage = postFeedService.getFeed(currentUserId, tab, sportTag, latitude, longitude, page, size);
        return ResponseEntity.ok(feedPage);
    }

    @GetMapping
    public ResponseEntity<?> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String tab,
            @RequestParam(required = false) String sportTag,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        Long currentUserId = getUserIdFromHeader(authHeader);
        String selectedTab = (tab != null && !tab.isBlank()) ? tab : "FOR_YOU";
        Page<Map<String, Object>> feedPage = postFeedService.getFeed(currentUserId, selectedTab, sportTag, latitude, longitude, page, size);
        return ResponseEntity.ok(feedPage);
    }

    @PostMapping
    public ResponseEntity<?> createPost(
            @RequestBody Map<String, Object> payload,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        Long currentUserId = getUserIdFromHeader(authHeader);
        if (currentUserId == null && payload.get("authorId") != null) {
            currentUserId = ((Number) payload.get("authorId")).longValue();
        }
        
        if (currentUserId == null) {
            User defaultUser = userRepository.findAll().stream().findFirst().orElse(null);
            if (defaultUser != null) {
                currentUserId = defaultUser.getId();
            } else {
                return ResponseEntity.status(401).body("Unauthorized");
            }
        }

        Post savedPost = postFeedService.createPostWithSecurity(payload, currentUserId);
        Map<String, Object> resp = new HashMap<>();
        resp.put("id", savedPost.getId());
        resp.put("content", savedPost.getContent());
        resp.put("type", savedPost.getType());
        resp.put("backgroundGradient", savedPost.getBackgroundGradient() != null ? Arrays.asList(savedPost.getBackgroundGradient().split(",")) : null);
        resp.put("backgroundId", savedPost.getBackgroundId());
        resp.put("totalPrice", savedPost.getTotalPrice());
        resp.put("note", savedPost.getNote());
        resp.put("venueId", savedPost.getVenue() != null ? savedPost.getVenue().getId().toString() : null);
        resp.put("venueName", savedPost.getVenueName());
        resp.put("createdAt", savedPost.getCreatedAt());
        resp.put("message", "Tạo bài viết thành công");
        return ResponseEntity.ok(resp);
    }

    /**
     * Tham gia vào bài viết ghép kèo (Có khóa bi quan Pessimistic Lock)
     */
    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinMatch(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long currentUserId = getUserIdFromHeader(authHeader);
        if (currentUserId == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Vui lòng đăng nhập để tham gia ghép kèo"));
        }

        Map<String, Object> result = postFeedService.joinMatchSlot(id, currentUserId);
        return ResponseEntity.ok(result);
    }

    /**
     * Rời khỏi kèo đấu
     */
    @DeleteMapping("/{id}/leave")
    public ResponseEntity<?> leaveMatch(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long currentUserId = getUserIdFromHeader(authHeader);
        if (currentUserId == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Vui lòng đăng nhập"));
        }

        Map<String, Object> result = postFeedService.leaveMatchSlot(id, currentUserId);
        return ResponseEntity.ok(result);
    }

    /**
     * Lấy danh sách thành viên đã tham gia kèo
     */
    @GetMapping("/{id}/participants")
    public ResponseEntity<?> getParticipants(@PathVariable Long id) {
        List<Map<String, Object>> participants = postFeedService.getPostParticipants(id);
        return ResponseEntity.ok(participants);
    }

    @Autowired
    private com.backend.sporta.repository.ClubRepository clubRepository;

    @PutMapping("/{id}")
    public ResponseEntity<?> editPost(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long currentUserId = getUserIdFromHeader(authHeader);
        if (currentUserId == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Vui lòng đăng nhập"));
        }

        Optional<Post> optionalPost = postRepository.findById(id);
        if (optionalPost.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Post post = optionalPost.get();
        if (!post.getAuthor().getId().equals(currentUserId)) {
            return ResponseEntity.status(403).body(Map.of("message", "Bạn không có quyền chỉnh sửa bài viết này"));
        }

        // Only NORMAL / COMMUNITY / STANDARD posts can be edited (no promotion / match finding)
        if ("MATCH_FINDING".equalsIgnoreCase(post.getType()) || "PROMOTION".equalsIgnoreCase(post.getType())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Chỉ có thể chỉnh sửa bài viết thông thường"));
        }

        if (payload.containsKey("content")) {
            post.setContent((String) payload.get("content"));
        }

        // Edit images (only allowed to keep/remove existing images, no new images)
        if (payload.containsKey("mediaUrls")) {
            List<?> rawUrls = (List<?>) payload.get("mediaUrls");
            List<String> newUrls = new ArrayList<>();
            if (rawUrls != null) {
                for (Object u : rawUrls) {
                    if (u != null) newUrls.add(u.toString());
                }
            }
            post.setMediaUrls(newUrls);
        }

        postRepository.save(post);
        return ResponseEntity.ok(Map.of("message", "Chỉnh sửa bài viết thành công", "id", post.getId()));
    }

    @PutMapping("/{id}/audience")
    public ResponseEntity<?> updatePostAudience(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long currentUserId = getUserIdFromHeader(authHeader);
        if (currentUserId == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Vui lòng đăng nhập"));
        }

        Optional<Post> optionalPost = postRepository.findById(id);
        if (optionalPost.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Post post = optionalPost.get();
        if (!post.getAuthor().getId().equals(currentUserId)) {
            return ResponseEntity.status(403).body(Map.of("message", "Bạn không có quyền thay đổi đối tượng xem"));
        }

        String audience = (String) payload.getOrDefault("audience", "PUBLIC");
        post.setAudience(audience);

        if ("CLUB".equalsIgnoreCase(audience) && payload.get("clubId") != null) {
            try {
                Long clubId = Long.parseLong(payload.get("clubId").toString());
                clubRepository.findById(clubId).ifPresent(post::setClub);
            } catch (Exception ignored) {}
        } else if ("PUBLIC".equalsIgnoreCase(audience)) {
            post.setClub(null);
        }

        postRepository.save(post);

        Map<String, Object> resp = new HashMap<>();
        resp.put("message", "Cập nhật đối tượng xem thành công");
        resp.put("audience", audience);
        if (post.getClub() != null) {
            Map<String, Object> clubMap = new HashMap<>();
            clubMap.put("id", post.getClub().getId().toString());
            clubMap.put("name", post.getClub().getName());
            clubMap.put("avatarUrl", post.getClub().getAvatarImage());
            resp.put("clubInfo", clubMap);
        }
        return ResponseEntity.ok(resp);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long currentUserId = getUserIdFromHeader(authHeader);
        if (currentUserId == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        Optional<Post> optionalPost = postRepository.findById(id);
        if (optionalPost.isPresent()) {
            Post post = optionalPost.get();
            if (!post.getAuthor().getId().equals(currentUserId)) {
                return ResponseEntity.status(403).body("Forbidden");
            }
            post.setIsDeleted(true);
            postRepository.save(post);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/hide")
    public ResponseEntity<?> hidePost(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long currentUserId = getUserIdFromHeader(authHeader);
        if (currentUserId == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Vui lòng đăng nhập"));
        }

        Optional<Post> optionalPost = postRepository.findById(id);
        if (optionalPost.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userRepository.findById(currentUserId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Người dùng không tồn tại"));
        }

        Post post = optionalPost.get();
        Optional<com.backend.sporta.entity.UserHiddenPost> existing = userHiddenPostRepository.findByUserAndPost(user, post);
        if (existing.isEmpty()) {
            com.backend.sporta.entity.UserHiddenPost hiddenPost = com.backend.sporta.entity.UserHiddenPost.builder()
                    .user(user)
                    .post(post)
                    .createdAt(LocalDateTime.now())
                    .build();
            userHiddenPostRepository.save(hiddenPost);
        }

        return ResponseEntity.ok(Map.of("message", "Đã ẩn bài viết thành công"));
    }

    @PostMapping("/{id}/unhide")
    public ResponseEntity<?> unhidePost(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long currentUserId = getUserIdFromHeader(authHeader);
        if (currentUserId == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Vui lòng đăng nhập"));
        }

        Optional<Post> optionalPost = postRepository.findById(id);
        if (optionalPost.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userRepository.findById(currentUserId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Người dùng không tồn tại"));
        }

        Post post = optionalPost.get();
        Optional<com.backend.sporta.entity.UserHiddenPost> existing = userHiddenPostRepository.findByUserAndPost(user, post);
        existing.ifPresent(userHiddenPostRepository::delete);

        return ResponseEntity.ok(Map.of("message", "Đã hoàn tác ẩn bài viết"));
    }

    @PostMapping(value = {"/{id}/like", "/{id}/react"})
    public ResponseEntity<?> likePost(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody(required = false) Map<String, String> payload) {
        
        try {
            Long currentUserId = getUserIdFromHeader(authHeader);
            if (currentUserId == null) {
                return ResponseEntity.status(401).body("Unauthorized");
            }

            Optional<Post> optionalPost = postRepository.findById(id);
            if (optionalPost.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Post post = optionalPost.get();
            User user = userRepository.findById(currentUserId).orElse(null);
            if (user == null) return ResponseEntity.status(401).build();

            String action = payload != null ? payload.get("action") : null;
            String reactionType = payload != null && payload.containsKey("reactionType") 
                                  ? payload.get("reactionType") : "like";

            Optional<PostReaction> existingOpt = postReactionRepository.findByPostAndUser(post, user);

            log.info("[REACT-DEBUG] postId={}, userId={}, action={}, reactionType={}, authorId={}, existingReaction={}", 
                    id, user.getId(), action, reactionType, 
                    post.getAuthor() != null ? post.getAuthor().getId() : "null",
                    existingOpt.map(PostReaction::getReactionType).orElse("NONE"));

            boolean isExplicitUnlike = "unlike".equalsIgnoreCase(action) || "null".equalsIgnoreCase(reactionType) || reactionType == null;

            if (isExplicitUnlike) {
                if (existingOpt.isPresent()) {
                    postReactionRepository.delete(existingOpt.get());
                    post.setLikeCount(Math.max(0, post.getLikeCount() - 1));
                    if (post.getAuthor() != null && !post.getAuthor().getId().equals(user.getId())) {
                        notificationService.deleteReactionNotification(post.getAuthor().getId(), user.getId(), post.getId());
                    }
                    postRepository.save(post);
                }
                return ResponseEntity.ok().build();
            }

            // Apply / Update Reaction
            if (existingOpt.isPresent()) {
                PostReaction existing = existingOpt.get();
                existing.setReactionType(reactionType);
                postReactionRepository.save(existing);
            } else {
                try {
                    PostReaction newReaction = PostReaction.builder()
                            .post(post)
                            .user(user)
                            .reactionType(reactionType)
                            .createdAt(LocalDateTime.now())
                            .build();
                    postReactionRepository.save(newReaction);
                    post.setLikeCount(post.getLikeCount() + 1);
                } catch (DataIntegrityViolationException ignored) {}
            }

            // Trigger notification when reaction is set (if not self)
            if (post.getAuthor() != null && !post.getAuthor().getId().equals(user.getId())) {
                String actorName = user.getFullName() != null && !user.getFullName().trim().isEmpty() ? user.getFullName() : (user.getEmail() != null ? user.getEmail().split("@")[0] : "Người chơi Sporta");
                try {
                    notificationService.upsertReactionNotification(post.getAuthor().getId(), user.getId(), actorName, user.getAvatarUrl(), post.getId(), reactionType);
                } catch (Exception notifEx) {
                    log.error("[REACT-DEBUG] Notification error (non-fatal): {}", notifEx.getMessage(), notifEx);
                }
            }

            postRepository.save(post);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("[REACT-DEBUG] FATAL ERROR in likePost for postId={}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(500).body("Internal error: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/share")
    public ResponseEntity<?> sharePost(@PathVariable Long id) {
        Optional<Post> optionalPost = postRepository.findById(id);
        if (optionalPost.isPresent()) {
            Post post = optionalPost.get();
            post.setShareCount((post.getShareCount() == null ? 0 : post.getShareCount()) + 1);
            postRepository.save(post);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<?> getPostComments(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Optional<Post> optionalPost = postRepository.findById(id);
        if (optionalPost.isPresent()) {
            Pageable pageable = PageRequest.of(page, size);
            Page<PostComment> comments = postCommentRepository.findByPostOrderByCreatedAtDesc(optionalPost.get(), pageable);
            return ResponseEntity.ok(comments);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/comment")
    public ResponseEntity<?> commentPost(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, String> payload) {
        
        Long currentUserId = getUserIdFromHeader(authHeader);
        if (currentUserId == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String content = payload.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Content is required");
        }

        Optional<Post> optionalPost = postRepository.findById(id);
        if (optionalPost.isPresent()) {
            Post post = optionalPost.get();
            User user = userRepository.findById(currentUserId).orElse(null);
            if (user == null) return ResponseEntity.status(401).build();

            PostComment comment = PostComment.builder()
                    .post(post)
                    .author(user)
                    .content(content)
                    .createdAt(LocalDateTime.now())
                    .build();
            postCommentRepository.save(comment);

            post.setCommentCount(post.getCommentCount() + 1);
            postRepository.save(post);

            // Send notification to post author if not self
            if (post.getAuthor() != null && !post.getAuthor().getId().equals(user.getId())) {
                String actorName = user.getFullName() != null && !user.getFullName().trim().isEmpty() ? user.getFullName() : (user.getEmail() != null ? user.getEmail().split("@")[0] : "Người chơi Sporta");
                String snippet = content.length() > 60 ? content.substring(0, 60) + "..." : content;
                notificationService.createNotification(
                        post.getAuthor().getId(),
                        Role.PLAYER,
                        actorName,
                        "đã bình luận về bài viết của bạn: \"" + snippet + "\"",
                        NotificationType.POST_COMMENTED,
                        "post:" + post.getId(),
                        user.getId(),
                        user.getAvatarUrl()
                );
            }
            
            return ResponseEntity.ok(comment);
        }
        return ResponseEntity.notFound().build();
    }
}
