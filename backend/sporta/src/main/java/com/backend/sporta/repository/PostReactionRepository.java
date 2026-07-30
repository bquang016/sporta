package com.backend.sporta.repository;

import com.backend.sporta.entity.Post;
import com.backend.sporta.entity.PostReaction;
import com.backend.sporta.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostReactionRepository extends JpaRepository<PostReaction, Long> {
    Optional<PostReaction> findByPostAndUser(Post post, User user);
    List<PostReaction> findByPostIdInAndUserId(List<Long> postIds, Long userId);

    @Query("SELECT r.post.id, r.reactionType, COUNT(r) FROM PostReaction r WHERE r.post.id IN :postIds GROUP BY r.post.id, r.reactionType")
    List<Object[]> countByPostIdsGroupedByType(@Param("postIds") List<Long> postIds);
}
