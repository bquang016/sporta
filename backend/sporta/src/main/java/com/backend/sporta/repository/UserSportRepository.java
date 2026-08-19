package com.backend.sporta.repository;

import com.backend.sporta.entity.UserSport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserSportRepository extends JpaRepository<UserSport, Long> {
    List<UserSport> findByUserId(Long userId);
    java.util.Optional<UserSport> findByUserIdAndSportId(Long userId, Long sportId);
}
