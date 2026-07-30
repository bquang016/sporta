package com.backend.sporta.repository;

import com.backend.sporta.entity.Post;
import com.backend.sporta.entity.PostComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostCommentRepository extends JpaRepository<PostComment, Long> {
    Page<PostComment> findByPostOrderByCreatedAtDesc(Post post, Pageable pageable);
    List<PostComment> findByPostOrderByCreatedAtDesc(Post post);
}
