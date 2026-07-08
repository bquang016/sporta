package com.backend.sporta.repository;

import com.backend.sporta.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.sporta.enums.Role;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.role = :role AND (u.isDeleted IS NULL OR u.isDeleted = false) AND (:search IS NULL OR :search = '' OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))) ORDER BY u.createdAt DESC")
    List<User> findByRoleAndSearch(@Param("role") Role role, @Param("search") String search);

    @Query("SELECT u FROM User u WHERE (u.isDeleted IS NULL OR u.isDeleted = false) AND (:search IS NULL OR :search = '' OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))) ORDER BY u.createdAt DESC")
    List<User> findBySearch(@Param("search") String search);

    @Query("SELECT u FROM User u WHERE u.isDeleted IS NULL OR u.isDeleted = false ORDER BY u.createdAt DESC")
    List<User> findAllActiveOrderByCreatedAtDesc();

    List<User> findAllByOrderByCreatedAtDesc();
}
