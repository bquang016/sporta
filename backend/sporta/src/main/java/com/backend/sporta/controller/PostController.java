package com.backend.sporta.controller;

import com.backend.sporta.entity.Post;
import com.backend.sporta.entity.PostComment;
import com.backend.sporta.entity.PostReaction;
import com.backend.sporta.entity.User;
import com.backend.sporta.repository.PostCommentRepository;
import com.backend.sporta.repository.PostReactionRepository;
import com.backend.sporta.repository.PostRepository;
import com.backend.sporta.repository.UserRepository;
import com.backend.sporta.security.JwtTokenProvider;
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

    private Long getUserIdFromHeader(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtTokenProvider.validateToken(token)) {
                Claims claims = jwtTokenProvider.getClaimsFromToken(token);
                Number userIdNum = claims.get("userId", Number.class);
                if (userIdNum != null) {
                    return userIdNum.longValue();
                }
            }
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<?> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> postsPage = postRepository.findByIsDeletedFalseOrderByCreatedAtDesc(pageable);
        
        // If DB is empty, seed initial data for demo
        if (postsPage.isEmpty() && page == 0) {
            seedInitialPosts();
            postsPage = postRepository.findByIsDeletedFalseOrderByCreatedAtDesc(pageable);
        }

        Long currentUserId = getUserIdFromHeader(authHeader);

        List<Long> postIds = postsPage.getContent().stream().map(Post::getId).collect(Collectors.toList());
        Map<Long, String> userReactions = new HashMap<>();
        
        if (currentUserId != null && !postIds.isEmpty()) {
            List<PostReaction> reactions = postReactionRepository.findByPostIdInAndUserId(postIds, currentUserId);
            for (PostReaction r : reactions) {
                userReactions.put(r.getPost().getId(), r.getReactionType());
            }
        }

        // Build per-post, per-type reaction counts from DB
        Map<Long, Map<String, Long>> postReactionCounts = new HashMap<>();
        if (!postIds.isEmpty()) {
            List<Object[]> rawCounts = postReactionRepository.countByPostIdsGroupedByType(postIds);
            for (Object[] row : rawCounts) {
                Long postId = ((Number) row[0]).longValue();
                String type = (String) row[1];
                Long count = ((Number) row[2]).longValue();
                postReactionCounts.computeIfAbsent(postId, k -> new HashMap<>()).put(type, count);
            }
        }

        Page<Map<String, Object>> responsePage = postsPage.map(post -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", post.getId());
            map.put("author", post.getAuthor());
            map.put("content", post.getContent());
            map.put("mediaUrls", post.getMediaUrls());
            map.put("type", post.getType());
            map.put("audience", post.getAudience());
            map.put("sportName", post.getSportName());
            map.put("venueName", post.getVenueName());
            map.put("timeSlot", post.getTimeSlot());
            map.put("memberFee", post.getMemberFee());
            map.put("promoTitle", post.getPromoTitle());
            map.put("promoCode", post.getPromoCode());
            map.put("discountText", post.getDiscountText());
            map.put("likeCount", post.getLikeCount());
            map.put("commentCount", post.getCommentCount());
            map.put("shareCount", post.getShareCount());
            map.put("createdAt", post.getCreatedAt());

            // Attach per-type reaction counts
            Map<String, Long> countsForPost = postReactionCounts.getOrDefault(post.getId(), new HashMap<>());
            Map<String, Long> reactionsCount = new HashMap<>();
            for (String key : new String[]{"like", "love", "fire", "clap", "muscle", "trophy"}) {
                reactionsCount.put(key, countsForPost.getOrDefault(key, 0L));
            }
            map.put("reactionsCount", reactionsCount);
            
            if (currentUserId != null && userReactions.containsKey(post.getId())) {
                map.put("userReaction", userReactions.get(post.getId()));
            }
            return map;
        });

        return ResponseEntity.ok(responsePage);
    }

    @PostMapping
    public ResponseEntity<?> createPost(@RequestBody Map<String, Object> payload) {
        String content = (String) payload.getOrDefault("content", "");
        @SuppressWarnings("unchecked")
        List<String> mediaUrls = (List<String>) payload.getOrDefault("mediaUrls", Collections.emptyList());
        String audience = (String) payload.getOrDefault("audience", "PUBLIC");
        String type = (String) payload.getOrDefault("type", "COMMUNITY");

        Number authorIdNum = (Number) payload.get("authorId");
        User author = null;
        
        if (authorIdNum != null) {
            author = userRepository.findById(authorIdNum.longValue()).orElse(null);
        }
        
        if (author == null) {
            author = userRepository.findAll().stream().findFirst().orElseThrow(() -> new RuntimeException("No user found"));
        }

        Post newPost = Post.builder()
                .author(author)
                .content(content)
                .mediaUrls(mediaUrls != null ? mediaUrls : Collections.emptyList())
                .type(type)
                .audience(audience)
                .likeCount(0)
                .commentCount(0)
                .shareCount(0)
                .createdAt(LocalDateTime.now())
                .build();

        Post saved = postRepository.save(newPost);
        return ResponseEntity.ok(saved);
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

    @PostMapping("/{id}/like")
    public ResponseEntity<?> likePost(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody(required = false) Map<String, String> payload) {
        
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

        String reactionType = payload != null && payload.containsKey("reactionType") 
                              ? payload.get("reactionType") : "like";

        Optional<PostReaction> existingOpt = postReactionRepository.findByPostAndUser(post, user);

        if (existingOpt.isPresent()) {
            PostReaction existing = existingOpt.get();
            if (existing.getReactionType().equals(reactionType)) {
                // Toggle off (unlike)
                postReactionRepository.delete(existing);
                post.setLikeCount(Math.max(0, post.getLikeCount() - 1));
            } else {
                // Change reaction
                existing.setReactionType(reactionType);
                postReactionRepository.save(existing);
            }
        } else {
            // New reaction
            try {
                PostReaction newReaction = PostReaction.builder()
                        .post(post)
                        .user(user)
                        .reactionType(reactionType)
                        .createdAt(LocalDateTime.now())
                        .build();
                postReactionRepository.save(newReaction);
                post.setLikeCount(post.getLikeCount() + 1);
            } catch (DataIntegrityViolationException e) {
                // Ignore duplicate key constraint
            }
        }

        postRepository.save(post);
        return ResponseEntity.ok().build();
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
            
            return ResponseEntity.ok(comment);
        }
        return ResponseEntity.notFound().build();
    }

    private void seedInitialPosts() {
        User defaultAuthor = userRepository.findAll().stream().findFirst().orElseGet(() -> {
            User newUser = User.builder()
                    .email("quanluu@sporta.vn")
                    .fullName("Quan Luu")
                    .phoneNumber("0987654321")
                    .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80")
                    .password("secret")
                    .role(com.backend.sporta.enums.Role.PLAYER)
                    .status(com.backend.sporta.enums.UserStatus.ACTIVE)
                    .build();
            return userRepository.save(newUser);
        });

        Post p1 = Post.builder()
                .author(defaultAuthor)
                .content("Chiều nay vừa hoàn thành buổi tập Pickleball giao lưu cùng anh em CLB Cầu Giấy! Sân bãi cực êm, hệ thống đèn chiếu sáng tiêu chuẩn. Hẹn anh em kèo tuần sau nhé! 🏓🔥")
                .mediaUrls(List.of("https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80"))
                .type("COMMUNITY")
                .audience("PUBLIC")
                .likeCount(24)
                .commentCount(5)
                .shareCount(2)
                .createdAt(LocalDateTime.now().minusHours(1))
                .build();

        Post p2 = Post.builder()
                .author(defaultAuthor)
                .content("Cần tìm 2 tay vợt Pickleball trình DUPR 3.0+ giao lưu đôi nam/nữ tối nay từ 19:30 - 21:30. Anh em nào rảnh chốt kèo ngay nhé!")
                .type("MATCH_FINDING")
                .sportName("Pickleball")
                .venueName("Sân Pickleball Quần Ngựa, Hà Nội")
                .timeSlot("Tối nay • 19:30 - 21:30")
                .memberFee("50k / người")
                .likeCount(12)
                .commentCount(8)
                .shareCount(1)
                .createdAt(LocalDateTime.now().minusHours(3))
                .build();

        Post p3 = Post.builder()
                .author(defaultAuthor)
                .content("🔥 ƯU ĐÃI ĐẶC BIỆT GIỜ VÀNG - SÂN CẦU LÔNG CẦU GIẤY 🔥\nGiảm ngay 20% cho tất cả các khung giờ từ 13h00 đến 16h00 từ Thứ 2 đến Thứ 6 tuần này!")
                .type("VENUE_PROMO")
                .promoTitle("Voucher Giảm 20% Giờ Vàng")
                .promoCode("SPORTAGIOGANG")
                .discountText("Giảm 20% tổng hóa đơn")
                .likeCount(45)
                .commentCount(14)
                .shareCount(10)
                .createdAt(LocalDateTime.now().minusHours(5))
                .build();

        postRepository.saveAll(List.of(p1, p2, p3));
    }
}
