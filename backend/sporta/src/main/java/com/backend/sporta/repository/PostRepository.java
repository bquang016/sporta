package com.backend.sporta.repository;

import com.backend.sporta.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    @EntityGraph(attributePaths = {"author", "mediaUrls"})
    Page<Post> findByIsDeletedFalseOrderByCreatedAtDesc(Pageable pageable);

    @EntityGraph(attributePaths = {"author", "mediaUrls"})
    List<Post> findByIsDeletedFalseOrderByCreatedAtDesc();
}
