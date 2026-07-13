package com.backend.sporta.repository;

import com.backend.sporta.entity.ClubMatchHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClubMatchHistoryRepository extends JpaRepository<ClubMatchHistory, Long> {

    List<ClubMatchHistory> findByClubIdOrderByDateDescCreatedAtDesc(Long clubId);
}
