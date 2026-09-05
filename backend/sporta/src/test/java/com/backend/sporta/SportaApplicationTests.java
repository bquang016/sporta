package com.backend.sporta;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@SpringBootTest
class SportaApplicationTests {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void contextLoads() {
        try {
            jdbcTemplate.execute("ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check");
            List<Map<String, Object>> clubs = jdbcTemplate.queryForList("SELECT id, name FROM clubs");
            System.out.println("=== SPORTA APPLICATION TEST: FOUND " + clubs.size() + " CLUBS ===");
            for (Map<String, Object> c : clubs) {
                Long clubId = ((Number) c.get("id")).longValue();
                String name = (String) c.get("name");

                Integer count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM club_members WHERE club_id = ? AND status = 'APPROVED'",
                    Integer.class,
                    clubId
                );
                int existing = count != null ? count : 0;
                System.out.println("CLUB ID=" + clubId + " ('" + name + "') CURRENT APPROVED MEMBERS: " + existing);

                if (existing < 10) {
                    int needed = 10 - existing;
                    for (int i = 1; i <= needed; i++) {
                        String uniqueId = UUID.randomUUID().toString().substring(0, 8);
                        String email = "member_c" + clubId + "_" + uniqueId + "@sporta.vn";
                        String encodedPass = passwordEncoder.encode("member123");

                        jdbcTemplate.update(
                            "INSERT INTO users (email, password, full_name, role, status, is_deleted, created_at, updated_at) " +
                            "VALUES (?, ?, ?, 'PLAYER', 'ACTIVE', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
                            email, encodedPass, "Thành Viên " + i + " (" + name + ")"
                        );

                        Long newUserId = jdbcTemplate.queryForObject(
                            "SELECT id FROM users WHERE email = ?",
                            Long.class,
                            email
                        );

                        if (newUserId != null) {
                            jdbcTemplate.update(
                                "INSERT INTO club_members (club_id, user_id, role, status, joined_at) " +
                                "VALUES (?, ?, 'MEMBER', 'APPROVED', CURRENT_TIMESTAMP)",
                                clubId, newUserId
                            );
                        }
                    }
                    Integer finalCount = jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM club_members WHERE club_id = ? AND status = 'APPROVED'",
                        Integer.class,
                        clubId
                    );
                    System.out.println("SUCCESSFULLY FORCE SEEDED DIRECT SQL FOR CLUB ID=" + clubId + " ('" + name + "') -> NEW TOTAL APPROVED MEMBERS: " + finalCount);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
