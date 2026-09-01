package com.backend.sporta.service.ai;

import com.backend.sporta.entity.Post;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Map;

public interface PostFeedService {

    /**
     * Lấy bảng tin thông minh đa chiều theo tab và ngữ cảnh người dùng
     */
    Page<Map<String, Object>> getFeed(
            Long currentUserId,
            String tab,
            String sportTag,
            Double latitude,
            Double longitude,
            int page,
            int size
    );

    /**
     * Tham gia vào 1 bài viết ghép kèo (Có khóa bi quan Pessimistic Lock)
     */
    Map<String, Object> joinMatchSlot(Long postId, Long currentUserId);

    /**
     * Rời khỏi kèo đấu
     */
    Map<String, Object> leaveMatchSlot(Long postId, Long currentUserId);

    /**
     * Lấy danh sách người đã tham gia kèo
     */
    List<Map<String, Object>> getPostParticipants(Long postId);

    /**
     * Tạo bài viết với kiểm tra phân quyền bảo mật (Ownership & Role Guard cho VENUE_PROMO)
     */
    Post createPostWithSecurity(Map<String, Object> payload, Long currentUserId);

    /**
     * Xóa cache bảng tin của người dùng khi có thay đổi quan hệ CLB
     */
    void clearFeedCache(Long userId);
}
