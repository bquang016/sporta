package com.backend.sporta.controller;

import com.backend.sporta.entity.Post;
import com.backend.sporta.entity.User;
import com.backend.sporta.repository.PostRepository;
import com.backend.sporta.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/posts")
@CrossOrigin(origins = "*")
public class PostController {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        List<Post> posts = postRepository.findAllByOrderByCreatedAtDesc();

        // Seed rich initial posts if database is empty
        if (posts.isEmpty()) {
            posts = seedInitialPosts();
        }

        return ResponseEntity.ok(posts);
    }

    @PostMapping
    public ResponseEntity<?> createPost(@RequestBody Map<String, Object> payload) {
        String content = (String) payload.getOrDefault("content", "");
        @SuppressWarnings("unchecked")
        List<String> mediaUrls = (List<String>) payload.getOrDefault("mediaUrls", Collections.emptyList());
        String audience = (String) payload.getOrDefault("audience", "PUBLIC");
        String type = (String) payload.getOrDefault("type", "COMMUNITY");

        // Fetch or create default author
        User author = userRepository.findAll().stream().findFirst().orElseGet(() -> {
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

    @PostMapping("/{id}/like")
    public ResponseEntity<?> likePost(@PathVariable Long id) {
        Optional<Post> optionalPost = postRepository.findById(id);
        if (optionalPost.isPresent()) {
            Post post = optionalPost.get();
            post.setLikeCount((post.getLikeCount() == null ? 0 : post.getLikeCount()) + 1);
            Post saved = postRepository.save(post);
            return ResponseEntity.ok(saved);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/share")
    public ResponseEntity<?> sharePost(@PathVariable Long id) {
        Optional<Post> optionalPost = postRepository.findById(id);
        if (optionalPost.isPresent()) {
            Post post = optionalPost.get();
            post.setShareCount((post.getShareCount() == null ? 0 : post.getShareCount()) + 1);
            Post saved = postRepository.save(post);
            return ResponseEntity.ok(saved);
        }
        return ResponseEntity.notFound().build();
    }

    private List<Post> seedInitialPosts() {
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

        return postRepository.saveAll(List.of(p1, p2, p3));
    }
}
