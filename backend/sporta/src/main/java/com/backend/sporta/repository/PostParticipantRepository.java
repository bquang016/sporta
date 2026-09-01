package com.backend.sporta.repository;

import com.backend.sporta.entity.PostParticipant;
import com.backend.sporta.enums.ParticipantStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostParticipantRepository extends JpaRepository<PostParticipant, Long> {

    Optional<PostParticipant> findByPostIdAndUserId(Long postId, Long userId);

    List<PostParticipant> findByPostIdAndStatusOrderByJoinedAtAsc(Long postId, ParticipantStatus status);

    long countByPostIdAndStatus(Long postId, ParticipantStatus status);

    @Query("SELECT p FROM PostParticipant p JOIN FETCH p.user WHERE p.post.id = :postId AND p.status = :status ORDER BY p.joinedAt ASC")
    List<PostParticipant> findByPostIdAndStatusWithUser(@Param("postId") Long postId, @Param("status") ParticipantStatus status);

    @Query("SELECT p.post.id, p.user.id FROM PostParticipant p WHERE p.post.id IN :postIds AND p.status = :status")
    List<Object[]> findUserIdsByPostIdInAndStatus(@Param("postIds") List<Long> postIds, @Param("status") ParticipantStatus status);

    @Query("SELECT p.post.id FROM PostParticipant p WHERE p.user.id = :userId AND p.status = 'JOINED' AND p.post.id IN :postIds")
    List<Long> findJoinedPostIdsByUserAndPostIdIn(@Param("userId") Long userId, @Param("postIds") List<Long> postIds);
}
