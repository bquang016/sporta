package com.backend.sporta.repository;

import com.backend.sporta.entity.Post;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    @EntityGraph(attributePaths = {"author", "mediaUrls", "venue", "voucher", "club"})
    Page<Post> findByIsDeletedFalseOrderByCreatedAtDesc(Pageable pageable);

    @EntityGraph(attributePaths = {"author", "mediaUrls", "venue", "voucher", "club"})
    List<Post> findByIsDeletedFalseOrderByCreatedAtDesc();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Post p WHERE p.id = :id")
    Optional<Post> findByIdWithLock(@Param("id") Long id);

    @EntityGraph(attributePaths = {"author", "mediaUrls", "venue", "voucher", "club"})
    @Query("SELECT p FROM Post p WHERE p.isDeleted = false AND p.createdAt >= :since ORDER BY p.createdAt DESC")
    List<Post> findCandidatePostsSince(@Param("since") LocalDateTime since);

    @EntityGraph(attributePaths = {"author", "mediaUrls", "venue", "voucher", "club"})
    @Query("SELECT p FROM Post p WHERE p.isDeleted = false AND p.type = :type AND p.createdAt >= :since ORDER BY p.createdAt DESC")
    List<Post> findCandidatePostsByTypeAndSince(@Param("type") String type, @Param("since") LocalDateTime since);

    @EntityGraph(attributePaths = {"author", "mediaUrls", "venue", "voucher", "club"})
    @Query("SELECT p FROM Post p WHERE p.id IN :ids")
    List<Post> findAllByIdInWithDetails(@Param("ids") List<Long> ids);

    Optional<Post> findFirstByMatchRoomIdAndIsDeletedFalseOrderByCreatedAtDesc(String matchRoomId);

    @Modifying
    @Query("UPDATE Post p SET p.matchStatus = com.backend.sporta.enums.MatchStatus.EXPIRED, p.updatedAt = :now " +
           "WHERE p.type = 'MATCH_FINDING' AND p.matchStatus IN (com.backend.sporta.enums.MatchStatus.OPEN, com.backend.sporta.enums.MatchStatus.FULL) " +
           "AND (p.playDate < :today OR (p.playDate = :today AND p.endTime < :currentTime))")
    int markExpiredMatchPosts(@Param("today") LocalDate today, 
                             @Param("currentTime") LocalTime currentTime, 
                             @Param("now") LocalDateTime now);
}
