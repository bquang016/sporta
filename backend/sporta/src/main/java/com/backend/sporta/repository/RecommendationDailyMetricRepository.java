package com.backend.sporta.repository;

import com.backend.sporta.entity.RecommendationDailyMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RecommendationDailyMetricRepository extends JpaRepository<RecommendationDailyMetric, Long> {

    Optional<RecommendationDailyMetric> findByReportDate(LocalDate reportDate);

    List<RecommendationDailyMetric> findTop30ByOrderByReportDateDesc();
}
