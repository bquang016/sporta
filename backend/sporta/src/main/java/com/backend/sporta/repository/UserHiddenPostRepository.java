package com.backend.sporta.repository;

import com.backend.sporta.entity.Post;
import com.backend.sporta.entity.User;
import com.backend.sporta.entity.UserHiddenPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserHiddenPostRepository extends JpaRepository<UserHiddenPost, Long> {
    Optional<UserHiddenPost> findByUserAndPost(User user, Post post);
    List<UserHiddenPost> findByUserId(Long userId);
    void deleteByUserAndPost(User user, Post post);
}
