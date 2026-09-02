package com.backend.sporta.repository;

import com.backend.sporta.entity.PollOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PollOptionRepository extends JpaRepository<PollOption, Long> {

    List<PollOption> findByPollIdOrderByDisplayOrderAscIdAsc(Long pollId);

    Optional<PollOption> findByPollIdAndIsJoinOptionTrue(Long pollId);

    void deleteByPollId(Long pollId);
}
