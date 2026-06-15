package com.backend.sporta.repository;

import com.backend.sporta.entity.UserSport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserSportRepository extends JpaRepository<UserSport, Long> {
}
