package com.backend.sporta.repository;

import com.backend.sporta.entity.DemandForecastMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DemandForecastMetricRepository extends JpaRepository<DemandForecastMetric, UUID> {

    List<DemandForecastMetric> findByCourtId(UUID courtId);

    @Query("SELECT m FROM DemandForecastMetric m WHERE m.court.id = :courtId AND m.dayOfWeek = :dayOfWeek AND m.startTime = :startTime")
    Optional<DemandForecastMetric> findByCourtIdAndDayOfWeekAndStartTime(
            @Param("courtId") UUID courtId,
            @Param("dayOfWeek") Integer dayOfWeek,
            @Param("startTime") java.time.LocalTime startTime
    );

    @Modifying
    @Query("DELETE FROM DemandForecastMetric m WHERE m.court.id = :courtId")
    void deleteByCourtId(@Param("courtId") UUID courtId);
}
