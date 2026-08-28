package com.backend.sporta.repository;

import com.backend.sporta.entity.Club;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClubRepository extends JpaRepository<Club, Long> {

    @Query("SELECT c FROM Club c WHERE c.id NOT IN (" +
           "  SELECT cm.club.id FROM ClubMember cm WHERE cm.user.id = :userId AND cm.status = 'APPROVED'" +
           ") AND (:sportId IS NULL OR c.sport.id = :sportId)")
    List<Club> findAvailableClubsWithoutQuery(@Param("userId") Long userId, 
                                              @Param("sportId") Long sportId);

    @Query("SELECT c FROM Club c WHERE c.id NOT IN (" +
           "  SELECT cm.club.id FROM ClubMember cm WHERE cm.user.id = :userId AND cm.status = 'APPROVED'" +
           ") AND (:sportId IS NULL OR c.sport.id = :sportId) " +
           "AND (LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(c.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Club> findAvailableClubsWithQuery(@Param("userId") Long userId, 
                                           @Param("sportId") Long sportId, 
                                           @Param("query") String query);

    @Query("SELECT cm.club FROM ClubMember cm WHERE cm.user.id = :userId AND cm.status = 'APPROVED' " +
           "AND (:sportId IS NULL OR cm.club.sport.id = :sportId)")
    List<Club> findJoinedClubsWithoutQuery(@Param("userId") Long userId, 
                                           @Param("sportId") Long sportId);

    @Query("SELECT cm.club FROM ClubMember cm WHERE cm.user.id = :userId AND cm.status = 'APPROVED' " +
           "AND (:sportId IS NULL OR cm.club.sport.id = :sportId) " +
           "AND (LOWER(cm.club.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(cm.club.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Club> findJoinedClubsWithQuery(@Param("userId") Long userId, 
                                        @Param("sportId") Long sportId, 
                                        @Param("query") String query);

    @Query("SELECT c FROM Club c WHERE (:sportId IS NULL OR c.sport.id = :sportId)")
    List<Club> findAllClubsWithoutQuery(@Param("sportId") Long sportId);

    @Query("SELECT c FROM Club c WHERE (:sportId IS NULL OR c.sport.id = :sportId) " +
           "AND (LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(c.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Club> findAllClubsWithQuery(@Param("sportId") Long sportId, 
                                     @Param("query") String query);

    boolean existsByName(String name);

    @Query("SELECT c FROM Club c WHERE (:sportId IS NULL OR c.sport.id = :sportId) AND (:area IS NULL OR LOWER(c.area) LIKE LOWER(CONCAT('%', :area, '%'))) ORDER BY COALESCE(c.crp, 0) DESC, COALESCE(c.rankedWins, 0) DESC, COALESCE(c.finalMatches, 0) DESC, c.id ASC")
    List<Club> findLeaderboardClubs(@Param("sportId") Long sportId, @Param("area") String area);
}
