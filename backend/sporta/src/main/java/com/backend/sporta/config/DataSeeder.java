package com.backend.sporta.config;

import com.backend.sporta.entity.Sport;
import com.backend.sporta.entity.User;
import com.backend.sporta.enums.Role;
import com.backend.sporta.enums.UserStatus;
import com.backend.sporta.entity.Owner;
import com.backend.sporta.entity.Court;
import com.backend.sporta.entity.VenueImage;
import com.backend.sporta.enums.CourtStatus;
import com.backend.sporta.enums.ApprovalStatus;
import com.backend.sporta.repository.SportRepository;
import com.backend.sporta.entity.Venue;
import com.backend.sporta.repository.VenueRepository;
import com.backend.sporta.repository.UserRepository;
import com.backend.sporta.repository.OwnerRepository;
import com.backend.sporta.repository.CourtRepository;
import com.backend.sporta.repository.VenueImageRepository;
import com.backend.sporta.entity.LockReason;
import com.backend.sporta.repository.LockReasonRepository;
import com.backend.sporta.entity.TicketSession;
import com.backend.sporta.enums.SportLevel;
import com.backend.sporta.enums.TicketSessionStatus;
import com.backend.sporta.repository.TicketSessionRepository;
import java.math.BigDecimal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.backend.sporta.entity.Club;
import com.backend.sporta.entity.ClubMember;
import com.backend.sporta.enums.ClubMemberRole;
import com.backend.sporta.enums.ClubMemberStatus;
import com.backend.sporta.repository.ClubRepository;
import com.backend.sporta.repository.ClubMemberRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private SportRepository sportRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OwnerRepository ownerRepository;

    @Autowired
    private CourtRepository courtRepository;

    @Autowired
    private VenueImageRepository venueImageRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private TicketSessionRepository ticketSessionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private LockReasonRepository lockReasonRepository;

    @Override
    public void run(String... args) throws Exception {
        // Fix for "users_role_check" constraint when adding new Roles
        try {
            jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
        } catch (Exception e) {
            System.out.println("Data Seeder: Bỏ qua việc xóa constraint users_role_check (có thể không tồn tại).");
        }
        try {
            jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check");
        } catch (Exception e) {
            System.out.println("Data Seeder: Bỏ qua việc xóa constraint users_status_check (có thể không tồn tại).");
        }

        try {
            jdbcTemplate.execute("ALTER TABLE courts DROP CONSTRAINT IF EXISTS courts_status_check");
        } catch (Exception e) {
            System.out.println("Data Seeder: Bỏ qua việc xóa constraint courts_status_check.");
        }

        // Fix for all orphaned NOT NULL constraints on "courts" due to schema migration
        try {
            java.util.List<String> validColumns = java.util.Arrays.asList("id", "venue_id", "name", "price", "status", "created_at", "updated_at");
            java.util.List<String> cols = jdbcTemplate.queryForList("SELECT column_name FROM information_schema.columns WHERE table_name = 'courts' AND is_nullable = 'NO'", String.class);
            for (String col : cols) {
                if (!validColumns.contains(col.toLowerCase())) {
                    jdbcTemplate.execute("ALTER TABLE courts ALTER COLUMN " + col + " DROP NOT NULL");
                    System.out.println("Data Seeder: Đã gỡ bỏ NOT NULL cho cột thừa trên bảng courts: " + col);
                }
            }
        } catch (Exception e) {
            System.out.println("Data Seeder: Bỏ qua việc sửa cột time trên courts.");
        }

        if (lockReasonRepository.count() == 0) {
            // Seed Player reasons
            lockReasonRepository.save(LockReason.builder().role(Role.PLAYER).reasonText("Bom sân / Đặt lịch ảo liên tục không đến.").isDefault(true).build());
            lockReasonRepository.save(LockReason.builder().role(Role.PLAYER).reasonText("Gian lận tài chính / Lợi dụng mã khuyến mãi bất hợp pháp.").isDefault(true).build());
            lockReasonRepository.save(LockReason.builder().role(Role.PLAYER).reasonText("Hành vi phi thể thao / Gây gổ, bạo lực tại sân đấu.").isDefault(true).build());
            lockReasonRepository.save(LockReason.builder().role(Role.PLAYER).reasonText("Spam / Dùng tài khoản giả mạo phá hoại cộng đồng.").isDefault(true).build());

            // Seed Owner reasons
            lockReasonRepository.save(LockReason.builder().role(Role.OWNER).reasonText("Cung cấp thông tin cụm sân giả mạo / Hình ảnh không đúng thực tế.").isDefault(true).build());
            lockReasonRepository.save(LockReason.builder().role(Role.OWNER).reasonText("Tự ý hủy lịch đặt của khách vào giờ chót không có lý do chính đáng.").isDefault(true).build());
            lockReasonRepository.save(LockReason.builder().role(Role.OWNER).reasonText("Gian lận hoa hồng / Ép khách giao dịch ngoài ứng dụng Sporta.").isDefault(true).build());
            lockReasonRepository.save(LockReason.builder().role(Role.OWNER).reasonText("Dịch vụ quá tệ / Bị người chơi khiếu nại nghiêm trọng liên tục.").isDefault(true).build());
            System.out.println("Data Seeder: Đã thêm các lý do khóa mặc định vào database.");
        }

        // Fix for "venues_approval_status_check" constraint when adding DRAFT approval status
        try {
            jdbcTemplate.execute("ALTER TABLE venues DROP CONSTRAINT IF EXISTS venues_approval_status_check");
        } catch (Exception e) {
            System.out.println("Data Seeder: Bỏ qua việc xóa constraint venues_approval_status_check (có thể không tồn tại).");
        }

        try {
            jdbcTemplate.execute("ALTER TABLE venues DROP CONSTRAINT IF EXISTS venues_status_check");
        } catch (Exception e) {
            System.out.println("Data Seeder: Bỏ qua việc xóa constraint venues_status_check.");
        }

        // Ensure column "address_detail" exists
        try {
            jdbcTemplate.execute("ALTER TABLE venues ADD COLUMN IF NOT EXISTS address_detail VARCHAR(255)");
        } catch (Exception e) {
            System.out.println("Data Seeder: Bỏ qua việc thêm cột address_detail (có thể đã tồn tại).");
        }

        // Ensure columns exist on match_rooms if table was created previously
        try {
            jdbcTemplate.execute("ALTER TABLE match_rooms ADD COLUMN IF NOT EXISTS host_club_id BIGINT");
            jdbcTemplate.execute("ALTER TABLE match_rooms ADD COLUMN IF NOT EXISTS guest_club_id BIGINT");
            jdbcTemplate.execute("ALTER TABLE match_rooms ADD COLUMN IF NOT EXISTS match_type VARCHAR(50)");
            jdbcTemplate.execute("ALTER TABLE match_rooms ADD COLUMN IF NOT EXISTS host_share_percent INT");
            jdbcTemplate.execute("ALTER TABLE match_rooms ADD COLUMN IF NOT EXISTS guest_share_percent INT");
            jdbcTemplate.execute("ALTER TABLE match_rooms ADD COLUMN IF NOT EXISTS guest_share_amount DOUBLE PRECISION");
            jdbcTemplate.execute("ALTER TABLE match_rooms ADD COLUMN IF NOT EXISTS desired_levels VARCHAR(255)");
            jdbcTemplate.execute("ALTER TABLE match_rooms ADD COLUMN IF NOT EXISTS status VARCHAR(50)");
            jdbcTemplate.execute("ALTER TABLE match_rooms ADD COLUMN IF NOT EXISTS join_deadline TIMESTAMP");
        } catch (Exception e) {
            System.out.println("Data Seeder: Bỏ qua việc thêm cột match_rooms.");
        }

        try {
            jdbcTemplate.execute("ALTER TABLE matches DROP CONSTRAINT IF EXISTS fk91a4fndwc8q6s6estfly09rru");
            jdbcTemplate.execute("ALTER TABLE matches DROP COLUMN IF EXISTS room_id CASCADE");
            jdbcTemplate.execute("ALTER TABLE matches ADD COLUMN IF NOT EXISTS room_id UUID");
        } catch (Exception e) {
            // Ignore
        }

        // Migrate existing venues' locations
        try {
            migrateVenueLocations();
        } catch (Exception e) {
            System.out.println("Lỗi khi di chuyển dữ liệu vị trí cũ: " + e.getMessage());
        }

        if (sportRepository.count() == 0) {
            sportRepository.save(new Sport(null, "Bóng đá"));
            sportRepository.save(new Sport(null, "Cầu lông"));
            sportRepository.save(new Sport(null, "Pickleball"));
            sportRepository.save(new Sport(null, "Bóng rổ"));
            System.out.println("Data Seeder: Đã thêm các môn thể thao mặc định vào database.");
        } else if (sportRepository.count() == 3) {
            sportRepository.save(new Sport(null, "Bóng rổ"));
            System.out.println("Data Seeder: Đã thêm Bóng rổ vào database.");
        }

        // Seed Super Admin
        if (userRepository.findByEmail("superadmin@sporta.vn").isEmpty()) {
            User superAdmin = User.builder()
                    .email("superadmin@sporta.vn")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("Super Admin")
                    .role(Role.SUPER_ADMIN)
                    .status(UserStatus.ACTIVE)
                    .build();
            userRepository.save(superAdmin);
            System.out.println("Data Seeder: Đã tạo tài khoản Super Admin (superadmin@sporta.vn / admin123).");
        }

        // Seed Admin
        if (userRepository.findByEmail("admin@sporta.vn").isEmpty()) {
            User admin = User.builder()
                    .email("admin@sporta.vn")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("Admin")
                    .role(Role.ADMIN)
                    .status(UserStatus.ACTIVE)
                    .build();
            userRepository.save(admin);
            System.out.println("Data Seeder: Đã tạo tài khoản Admin (admin@sporta.vn / admin123).");
        }

        // Ensure new personal info columns exist on owner_registrations & owners
        try {
            jdbcTemplate.execute("ALTER TABLE owner_registrations ADD COLUMN IF NOT EXISTS gender VARCHAR(20)");
            jdbcTemplate.execute("ALTER TABLE owner_registrations ADD COLUMN IF NOT EXISTS nationality VARCHAR(100)");
            jdbcTemplate.execute("ALTER TABLE owner_registrations ADD COLUMN IF NOT EXISTS hometown VARCHAR(255)");
            jdbcTemplate.execute("ALTER TABLE owner_registrations ADD COLUMN IF NOT EXISTS permanent_address TEXT");
            jdbcTemplate.execute("ALTER TABLE owner_registrations ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20)");

            jdbcTemplate.execute("ALTER TABLE owners ADD COLUMN IF NOT EXISTS gender VARCHAR(20)");
            jdbcTemplate.execute("ALTER TABLE owners ADD COLUMN IF NOT EXISTS nationality VARCHAR(100)");
            jdbcTemplate.execute("ALTER TABLE owners ADD COLUMN IF NOT EXISTS permanent_address TEXT");

            // Migration for Elo & CRP v2 system
            jdbcTemplate.execute("ALTER TABLE user_sports ADD COLUMN IF NOT EXISTS elo_rating INTEGER");
            jdbcTemplate.execute("ALTER TABLE user_sports ADD COLUMN IF NOT EXISTS elo_status VARCHAR(20) DEFAULT 'UNVERIFIED'");
            jdbcTemplate.execute("ALTER TABLE user_sports ADD COLUMN IF NOT EXISTS placement_matches_played INTEGER DEFAULT 0");
            jdbcTemplate.execute("ALTER TABLE user_sports ADD COLUMN IF NOT EXISTS total_ranked_matches INTEGER DEFAULT 0");
            jdbcTemplate.execute("ALTER TABLE user_sports ADD COLUMN IF NOT EXISTS total_wins INTEGER DEFAULT 0");
            jdbcTemplate.execute("ALTER TABLE user_sports ADD COLUMN IF NOT EXISTS last_match_at TIMESTAMP");

            jdbcTemplate.execute("UPDATE user_sports SET elo_rating = CASE " +
                    "WHEN level = 'WEAK' THEN 900 " +
                    "WHEN level = 'WEAK_AVERAGE' THEN 1200 " +
                    "WHEN level = 'AVERAGE' THEN 1500 " +
                    "WHEN level = 'AVERAGE_GOOD' THEN 1800 " +
                    "WHEN level = 'GOOD' THEN 2100 " +
                    "ELSE 1000 END WHERE elo_rating IS NULL");

            jdbcTemplate.execute("UPDATE user_sports SET elo_status = 'UNVERIFIED' WHERE elo_status IS NULL");
            jdbcTemplate.execute("UPDATE user_sports SET placement_matches_played = 0 WHERE placement_matches_played IS NULL");
            jdbcTemplate.execute("UPDATE user_sports SET total_ranked_matches = 0 WHERE total_ranked_matches IS NULL");
            jdbcTemplate.execute("UPDATE user_sports SET total_wins = 0 WHERE total_wins IS NULL");

            jdbcTemplate.execute("ALTER TABLE clubs ADD COLUMN IF NOT EXISTS min_elo_required INTEGER DEFAULT 0");
            jdbcTemplate.execute("ALTER TABLE clubs ADD COLUMN IF NOT EXISTS recruitment_status VARCHAR(20) DEFAULT 'OPEN'");
            jdbcTemplate.execute("UPDATE clubs SET min_elo_required = 0 WHERE min_elo_required IS NULL");
            jdbcTemplate.execute("UPDATE clubs SET recruitment_status = 'OPEN' WHERE recruitment_status IS NULL");

            jdbcTemplate.execute("ALTER TABLE club_polls ADD COLUMN IF NOT EXISTS match_id UUID");

            jdbcTemplate.execute("ALTER TABLE tickets ADD COLUMN IF NOT EXISTS team VARCHAR(20)");
            jdbcTemplate.execute("ALTER TABLE tickets ADD COLUMN IF NOT EXISTS is_captain BOOLEAN DEFAULT FALSE");
            jdbcTemplate.execute("ALTER TABLE tickets ADD COLUMN IF NOT EXISTS is_score_confirmed BOOLEAN DEFAULT FALSE");
            jdbcTemplate.execute("UPDATE tickets SET is_captain = FALSE WHERE is_captain IS NULL");
            jdbcTemplate.execute("UPDATE tickets SET is_score_confirmed = FALSE WHERE is_score_confirmed IS NULL");

            jdbcTemplate.execute("ALTER TABLE ticket_sessions ADD COLUMN IF NOT EXISTS host_score VARCHAR(50)");
            jdbcTemplate.execute("ALTER TABLE ticket_sessions ADD COLUMN IF NOT EXISTS guest_score VARCHAR(50)");
            jdbcTemplate.execute("ALTER TABLE ticket_sessions ADD COLUMN IF NOT EXISTS match_outcome VARCHAR(20)");
            jdbcTemplate.execute("ALTER TABLE ticket_sessions ADD COLUMN IF NOT EXISTS is_elo_settled BOOLEAN DEFAULT FALSE");
            jdbcTemplate.execute("ALTER TABLE ticket_sessions ADD COLUMN IF NOT EXISTS score_declared_at TIMESTAMP");
            jdbcTemplate.execute("ALTER TABLE ticket_sessions ADD COLUMN IF NOT EXISTS score_confirmed_count INTEGER DEFAULT 0");
            jdbcTemplate.execute("ALTER TABLE ticket_sessions ADD COLUMN IF NOT EXISTS has_host_team BOOLEAN DEFAULT FALSE");
            jdbcTemplate.execute("ALTER TABLE ticket_sessions ADD COLUMN IF NOT EXISTS host_team_name VARCHAR(100)");
            jdbcTemplate.execute("ALTER TABLE ticket_sessions ADD COLUMN IF NOT EXISTS host_team_level VARCHAR(50)");
            jdbcTemplate.execute("UPDATE ticket_sessions SET has_host_team = FALSE WHERE has_host_team IS NULL");
            jdbcTemplate.execute("UPDATE ticket_sessions SET is_elo_settled = FALSE WHERE is_elo_settled IS NULL");
            jdbcTemplate.execute("UPDATE ticket_sessions SET score_confirmed_count = 0 WHERE score_confirmed_count IS NULL");
            jdbcTemplate.execute("UPDATE ticket_sessions SET is_disputed = FALSE WHERE is_disputed IS NULL");
        } catch (Exception e) {
            System.out.println("Data Seeder: Bỏ qua việc thêm cột mới trên owner_registrations / owners / Elo v2: " + e.getMessage());
        }

        // Seed Default Owner User
        if (userRepository.findByEmail("owner@sporta.vn").isEmpty()) {
            User ownerUser = User.builder()
                    .email("owner@sporta.vn")
                    .password(passwordEncoder.encode("owner123"))
                    .fullName("Chủ Sân Sporta")
                    .phoneNumber("0987654321")
                    .gender(com.backend.sporta.enums.Gender.MALE)
                    .role(Role.OWNER)
                    .status(UserStatus.ACTIVE)
                    .build();
            ownerUser = userRepository.save(ownerUser);
            System.out.println("Data Seeder: Đã tạo tài khoản user xác thực owner (owner@sporta.vn / owner123).");

            Owner ownerProfile = Owner.builder()
                    .user(ownerUser)
                    .fullName("Chủ Sân Sporta")
                    .phoneNumber("0987654321")
                    .gender("Nam")
                    .nationality("Việt Nam")
                    .dateOfBirth(LocalDate.of(1990, 1, 1))
                    .hometown("Thành phố Hà Nội")
                    .permanentAddress("12 Duy Tân, Phường Dịch Vọng Hậu, Quận Cầu Giấy, Thành phố Hà Nội")
                    .build();
            ownerProfile = ownerRepository.save(ownerProfile);
            System.out.println("Data Seeder: Đã tạo thông tin hồ sơ Owner chi tiết liên kết tài khoản.");
        }

        // Seed default Player User
        seedPlayerUser();

        // Seed sample Ticket Sessions for User testing
        seedTicketSessions();

        // Seed active members for all clubs so every club is 100% eligible for matchmaking testing
        seedClubMembers();
    }

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private ClubMemberRepository clubMemberRepository;

    @Transactional
    public void seedClubMembers() {
        // 1. Ensure sample clubs exist for testing
        Sport football = sportRepository.findByName("Bóng đá").orElse(null);
        Sport badminton = sportRepository.findByName("Cầu lông").orElse(null);
        User player = userRepository.findByEmail("player@sporta.vn").orElse(null);

        if (clubRepository.count() == 0 && football != null && player != null) {
            Club c1 = Club.builder()
                    .name("CLB Bóng Đá FC Sporta Hà Nội")
                    .description("Câu lạc bộ bóng đá phong trào phong độ cao.")
                    .activityLevel("Hoạt động hàng tuần")
                    .area("Cầu Giấy, Hà Nội")
                    .maxMembers(50)
                    .elo(1200)
                    .sport(football)
                    .creator(player)
                    .build();
            c1 = clubRepository.save(c1);

            ClubMember m1 = ClubMember.builder()
                    .club(c1)
                    .user(player)
                    .role(ClubMemberRole.ADMIN)
                    .status(ClubMemberStatus.APPROVED)
                    .build();
            clubMemberRepository.save(m1);

            if (badminton != null) {
                Club c2 = Club.builder()
                        .name("CLB Cầu Lông Smash Champions")
                        .description("CLB cầu lông phong trào ghép giao hữu & xếp hạng.")
                        .activityLevel("Hoạt động sôi nổi")
                        .area("Thanh Xuân, Hà Nội")
                        .maxMembers(50)
                        .elo(1150)
                        .sport(badminton)
                        .creator(player)
                        .build();
                c2 = clubRepository.save(c2);

                ClubMember m2 = ClubMember.builder()
                        .club(c2)
                        .user(player)
                        .role(ClubMemberRole.ADMIN)
                        .status(ClubMemberStatus.APPROVED)
                        .build();
                clubMemberRepository.save(m2);
            }
            clubRepository.flush();
            clubMemberRepository.flush();
            System.out.println("Data Seeder: Đã khởi tạo 2 CLB mẫu mặc định cho người dùng.");
        }

        // 2. Pure JPA Seeding for ALL existing clubs (Works on PostgreSQL, H2, MySQL, Fresh DB)
        try {
            List<Club> allClubs = clubRepository.findAll();
            System.out.println("Data Seeder (JPA Clean): Tìm thấy " + allClubs.size() + " CLB trong Database.");

            for (Club club : allClubs) {
                // Ensure club creator is ADMIN member if not present
                if (club.getCreator() != null) {
                    boolean hasAdmin = clubMemberRepository.findByClubIdAndUserId(club.getId(), club.getCreator().getId()).isPresent();
                    if (!hasAdmin) {
                        ClubMember adminMember = ClubMember.builder()
                                .club(club)
                                .user(club.getCreator())
                                .role(ClubMemberRole.ADMIN)
                                .status(ClubMemberStatus.APPROVED)
                                .build();
                        clubMemberRepository.save(adminMember);
                    }
                }

                // Ensure club has a vibrant sporty avatar
                if (club.getAvatarImage() == null || club.getAvatarImage().isBlank()) {
                    String sport = club.getSport() != null ? club.getSport().getName().toLowerCase() : "";
                    if (sport.contains("cầu lông") || sport.contains("badminton")) {
                        club.setAvatarImage("https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=200&auto=format&fit=crop&q=80");
                    } else if (sport.contains("pickleball")) {
                        club.setAvatarImage("https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=200&auto=format&fit=crop&q=80");
                    } else if (sport.contains("bóng rổ") || sport.contains("basketball")) {
                        club.setAvatarImage("https://images.unsplash.com/photo-1546519638-68e109498ffc?w=200&auto=format&fit=crop&q=80");
                    } else {
                        club.setAvatarImage("https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=200&auto=format&fit=crop&q=80");
                    }
                    clubRepository.save(club);
                }

                long existingCount = clubMemberRepository.countByClubIdAndStatus(club.getId(), ClubMemberStatus.APPROVED);
                if (existingCount < 10) {
                    int needed = (int) (10 - existingCount);
                    for (int i = 1; i <= needed; i++) {
                        String uniqueId = UUID.randomUUID().toString().substring(0, 8);
                        String email = "member_c" + club.getId() + "_" + uniqueId + "@sporta.vn";

                        User memberUser = User.builder()
                                .email(email)
                                .password(passwordEncoder.encode("member123"))
                                .fullName("Thành Viên " + i + " (" + club.getName() + ")")
                                .role(Role.PLAYER)
                                .status(UserStatus.ACTIVE)
                                .isDeleted(false)
                                .build();
                        memberUser = userRepository.save(memberUser);

                        ClubMember memberRecord = ClubMember.builder()
                                .club(club)
                                .user(memberUser)
                                .role(ClubMemberRole.MEMBER)
                                .status(ClubMemberStatus.APPROVED)
                                .build();
                        clubMemberRepository.save(memberRecord);
                    }
                    long finalCount = clubMemberRepository.countByClubIdAndStatus(club.getId(), ClubMemberStatus.APPROVED);
                    System.out.println("Data Seeder (JPA Clean): Đã thêm thành viên cho CLB ID=" + club.getId() + " ('" + club.getName() + "') -> Tổng thành viên APPROVED: " + finalCount);
                } else {
                    System.out.println("Data Seeder (JPA Clean): CLB ID=" + club.getId() + " ('" + club.getName() + "') đã có đủ " + existingCount + " thành viên APPROVED.");
                }
            }

            userRepository.flush();
            clubMemberRepository.flush();

            // Safely synchronize PostgreSQL sequence if running on PostgreSQL
            try {
                jdbcTemplate.execute("SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users))");
            } catch (Exception ignored) {}
        } catch (Exception e) {
            System.out.println("Data Seeder Error: " + e.getMessage());
        }
    }

    private void seedPlayerUser() {
        if (userRepository.findByEmail("player@sporta.vn").isEmpty()) {
            User player = User.builder()
                    .email("player@sporta.vn")
                    .password(passwordEncoder.encode("player123"))
                    .fullName("Nguyễn Văn Hùng")
                    .phoneNumber("0912345678")
                    .role(Role.PLAYER)
                    .status(UserStatus.ACTIVE)
                    .build();
            userRepository.save(player);
            System.out.println("Data Seeder: Đã tạo tài khoản Player dùng thử (player@sporta.vn / player123).");
        }
    }

    private void seedTicketSessions() {
        if (ticketSessionRepository.count() >= 8) {
            System.out.println("Data Seeder: Đã có đủ ca xé vé trong database (" + ticketSessionRepository.count() + " ca).");
            return;
        }

        User ownerUser = userRepository.findByEmail("owner@sporta.vn").orElse(null);
        if (ownerUser == null) {
            System.out.println("Data Seeder: Không tìm thấy tài khoản owner@sporta.vn để gán ca xé vé.");
            return;
        }

        Owner owner = ownerRepository.findByUserId(ownerUser.getId()).orElseGet(() -> {
            Owner newOwner = Owner.builder()
                    .user(ownerUser)
                    .fullName("Chủ Sân Sporta")
                    .phoneNumber("0987654321")
                    .dateOfBirth(LocalDate.of(1990, 1, 1))
                    .hometown("Hà Nội")
                    .build();
            return ownerRepository.save(newOwner);
        });

        Sport football = sportRepository.findByName("Bóng đá").orElseGet(() -> sportRepository.save(new Sport(null, "Bóng đá")));
        Sport badminton = sportRepository.findByName("Cầu lông").orElseGet(() -> sportRepository.save(new Sport(null, "Cầu lông")));
        Sport pickleball = sportRepository.findByName("Pickleball").orElseGet(() -> sportRepository.save(new Sport(null, "Pickleball")));

        // Venue 1: Green Field Duy Tân
        Venue v1 = venueRepository.findAll().stream().filter(v -> v.getName() != null && v.getName().contains("Green Field")).findFirst().orElseGet(() -> {
            Venue venue = Venue.builder()
                    .owner(owner)
                    .name("Sân Bóng Đá Green Field")
                    .location("12 Duy Tân, Dịch Vọng Hậu, Cầu Giấy, Hà Nội")
                    .addressDetail("12 Duy Tân")
                    .ward("Dịch Vọng Hậu")
                    .district("Cầu Giấy")
                    .province("Hà Nội")
                    .latitude(21.0315)
                    .longitude(105.7832)
                    .sport(football)
                    .sportTypes("Bóng đá")
                    .subCourtCount(4)
                    .openingTime(LocalTime.of(6, 0))
                    .closingTime(LocalTime.of(23, 0))
                    .shiftDurationMinutes(30)
                    .status(com.backend.sporta.enums.VenueStatus.ACTIVE)
                    .approvalStatus(com.backend.sporta.enums.ApprovalStatus.APPROVED)
                    .coverImage("https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=700&auto=format&fit=crop&q=60")
                    .build();
            return venueRepository.save(venue);
        });

        Court c1 = courtRepository.findByVenueId(v1.getId()).stream().findFirst().orElseGet(() -> {
            Court court = Court.builder()
                    .venue(v1)
                    .name("Sân 7 - Sân A1")
                    .price(300000.0)
                    .status(com.backend.sporta.enums.CourtStatus.ACTIVE)
                    .build();
            return courtRepository.save(court);
        });

        Court c1_2 = courtRepository.findByVenueId(v1.getId()).stream().filter(c -> c.getName().contains("A2")).findFirst().orElseGet(() -> {
            Court court = Court.builder()
                    .venue(v1)
                    .name("Sân 7 - Sân A2")
                    .price(300000.0)
                    .status(com.backend.sporta.enums.CourtStatus.ACTIVE)
                    .build();
            return courtRepository.save(court);
        });

        // Venue 2: Hoop Heaven Park
        Venue v2 = venueRepository.findAll().stream().filter(v -> v.getName() != null && v.getName().contains("Hoop Heaven")).findFirst().orElseGet(() -> {
            Venue venue = Venue.builder()
                    .owner(owner)
                    .name("CLB Cầu Lông Hoop Heaven Park")
                    .location("34 Lê Văn Lương, Nhân Chính, Thanh Xuân, Hà Nội")
                    .addressDetail("34 Lê Văn Lương")
                    .ward("Nhân Chính")
                    .district("Thanh Xuân")
                    .province("Hà Nội")
                    .latitude(21.0042)
                    .longitude(105.8051)
                    .sport(badminton)
                    .sportTypes("Cầu lông")
                    .subCourtCount(6)
                    .openingTime(LocalTime.of(6, 0))
                    .closingTime(LocalTime.of(23, 0))
                    .shiftDurationMinutes(30)
                    .status(com.backend.sporta.enums.VenueStatus.ACTIVE)
                    .approvalStatus(com.backend.sporta.enums.ApprovalStatus.APPROVED)
                    .coverImage("https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=700&auto=format&fit=crop&q=80")
                    .build();
            return venueRepository.save(venue);
        });

        Court c2 = courtRepository.findByVenueId(v2.getId()).stream().findFirst().orElseGet(() -> {
            Court court = Court.builder()
                    .venue(v2)
                    .name("Sân Cầu Lông Số 3")
                    .price(120000.0)
                    .status(com.backend.sporta.enums.CourtStatus.ACTIVE)
                    .build();
            return courtRepository.save(court);
        });

        Court c2_1 = courtRepository.findByVenueId(v2.getId()).stream().filter(c -> c.getName().contains("Số 1")).findFirst().orElseGet(() -> {
            Court court = Court.builder()
                    .venue(v2)
                    .name("Sân Cầu Lông Số 1")
                    .price(120000.0)
                    .status(com.backend.sporta.enums.CourtStatus.ACTIVE)
                    .build();
            return courtRepository.save(court);
        });

        // Venue 3: CMC Pickleball Complex
        Venue v3 = venueRepository.findAll().stream().filter(v -> v.getName() != null && v.getName().contains("CMC")).findFirst().orElseGet(() -> {
            Venue venue = Venue.builder()
                    .owner(owner)
                    .name("Sân Pickleball CMC Cầu Giấy")
                    .location("Đại học Quốc Gia, Dịch Vọng Hậu, Cầu Giấy, Hà Nội")
                    .addressDetail("Đại học Quốc Gia, Cầu Giấy")
                    .ward("Dịch Vọng Hậu")
                    .district("Cầu Giấy")
                    .province("Hà Nội")
                    .latitude(21.0368)
                    .longitude(105.7821)
                    .sport(pickleball)
                    .sportTypes("Pickleball")
                    .subCourtCount(4)
                    .openingTime(LocalTime.of(6, 0))
                    .closingTime(LocalTime.of(22, 30))
                    .shiftDurationMinutes(30)
                    .status(com.backend.sporta.enums.VenueStatus.ACTIVE)
                    .approvalStatus(com.backend.sporta.enums.ApprovalStatus.APPROVED)
                    .coverImage("https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=700&auto=format&fit=crop&q=80")
                    .build();
            return venueRepository.save(venue);
        });

        Court c3 = courtRepository.findByVenueId(v3.getId()).stream().findFirst().orElseGet(() -> {
            Court court = Court.builder()
                    .venue(v3)
                    .name("Sân Pickleball P1")
                    .price(150000.0)
                    .status(com.backend.sporta.enums.CourtStatus.ACTIVE)
                    .build();
            return courtRepository.save(court);
        });

        Court c3_2 = courtRepository.findByVenueId(v3.getId()).stream().filter(c -> c.getName().contains("P2")).findFirst().orElseGet(() -> {
            Court court = Court.builder()
                    .venue(v3)
                    .name("Sân Pickleball P2")
                    .price(150000.0)
                    .status(com.backend.sporta.enums.CourtStatus.ACTIVE)
                    .build();
            return courtRepository.save(court);
        });

        if (ticketSessionRepository.count() == 0) {
            // 1. Session 1: Green Field (Còn 3 slot)
            TicketSession s1 = TicketSession.builder()
                    .venue(v1)
                    .court(c1)
                    .playDate(LocalDate.now())
                    .startTime(LocalTime.of(18, 0))
                    .endTime(LocalTime.of(20, 0))
                    .pricePerTicket(BigDecimal.valueOf(50000))
                    .maxSlots(10)
                    .bookedSlots(7)
                    .sportLevel(SportLevel.AVERAGE_GOOD)
                    .status(TicketSessionStatus.OPEN)
                    .build();
            ticketSessionRepository.save(s1);

            // 2. Session 2: Hoop Heaven (Còn đúng 1 slot - Dễ test Race Condition & Mua vé slot cuối)
            TicketSession s2 = TicketSession.builder()
                    .venue(v2)
                    .court(c2)
                    .playDate(LocalDate.now())
                    .startTime(LocalTime.of(20, 30))
                    .endTime(LocalTime.of(22, 30))
                    .pricePerTicket(BigDecimal.valueOf(60000))
                    .maxSlots(4)
                    .bookedSlots(3)
                    .sportLevel(SportLevel.AVERAGE)
                    .status(TicketSessionStatus.OPEN)
                    .build();
            ticketSessionRepository.save(s2);

            // 3. Session 3: CMC Pickleball (Còn 3 slot, Ngày mai)
            TicketSession s3 = TicketSession.builder()
                    .venue(v3)
                    .court(c3)
                    .playDate(LocalDate.now().plusDays(1))
                    .startTime(LocalTime.of(17, 0))
                    .endTime(LocalTime.of(19, 0))
                    .pricePerTicket(BigDecimal.valueOf(75000))
                    .maxSlots(4)
                    .bookedSlots(1)
                    .sportLevel(SportLevel.WEAK)
                    .status(TicketSessionStatus.OPEN)
                    .build();
            ticketSessionRepository.save(s3);

            // 4. Session 4: Sân Cầu Lông Đã Hết Slot (Full)
            TicketSession s4 = TicketSession.builder()
                    .venue(v2)
                    .court(c2)
                    .playDate(LocalDate.now())
                    .startTime(LocalTime.of(16, 0))
                    .endTime(LocalTime.of(18, 0))
                    .pricePerTicket(BigDecimal.valueOf(55000))
                    .maxSlots(6)
                    .bookedSlots(6)
                    .sportLevel(SportLevel.AVERAGE)
                    .status(TicketSessionStatus.FULL)
                    .build();
            ticketSessionRepository.save(s4);
        }

        // --- NHÓM CA XÉ VÉ MỚI (NHIỀU SLOT TRỐNG ĐỂ TEST ĐẶT NHIỀU VÉ CÙNG LÚC) ---

        // 5. Session 5: Sân Bóng Đá Duy Tân - Tối nay - CÒN 12 SLOT TRỐNG (Đặt nhóm lớn)
        TicketSession s5 = TicketSession.builder()
                .venue(v1)
                .court(c1_2)
                .playDate(LocalDate.now())
                .startTime(LocalTime.of(20, 0))
                .endTime(LocalTime.of(22, 0))
                .pricePerTicket(BigDecimal.valueOf(60000))
                .maxSlots(14)
                .bookedSlots(2)
                .sportLevel(SportLevel.AVERAGE)
                .status(TicketSessionStatus.OPEN)
                .build();
        ticketSessionRepository.save(s5);

        // 6. Session 6: CLB Cầu Lông Hoop Heaven - Tối nay - CÒN 7 SLOT TRỐNG
        TicketSession s6 = TicketSession.builder()
                .venue(v2)
                .court(c2_1)
                .playDate(LocalDate.now())
                .startTime(LocalTime.of(18, 30))
                .endTime(LocalTime.of(20, 30))
                .pricePerTicket(BigDecimal.valueOf(55000))
                .maxSlots(8)
                .bookedSlots(1)
                .sportLevel(SportLevel.WEAK_AVERAGE)
                .status(TicketSessionStatus.OPEN)
                .build();
        ticketSessionRepository.save(s6);

        // 7. Session 7: Sân Pickleball CMC Cầu Giấy - Tối nay - CÒN NGUYÊN 6 SLOT TRỐNG
        TicketSession s7 = TicketSession.builder()
                .venue(v3)
                .court(c3_2)
                .playDate(LocalDate.now())
                .startTime(LocalTime.of(19, 30))
                .endTime(LocalTime.of(21, 30))
                .pricePerTicket(BigDecimal.valueOf(80000))
                .maxSlots(6)
                .bookedSlots(0)
                .sportLevel(SportLevel.GOOD)
                .status(TicketSessionStatus.OPEN)
                .build();
        ticketSessionRepository.save(s7);

        // 8. Session 8: Sân Bóng Đá Green Field - Ngày Mai - CÒN 8 SLOT TRỐNG
        TicketSession s8 = TicketSession.builder()
                .venue(v1)
                .court(c1)
                .playDate(LocalDate.now().plusDays(1))
                .startTime(LocalTime.of(19, 0))
                .endTime(LocalTime.of(21, 0))
                .pricePerTicket(BigDecimal.valueOf(50000))
                .maxSlots(10)
                .bookedSlots(2)
                .sportLevel(SportLevel.AVERAGE_GOOD)
                .status(TicketSessionStatus.OPEN)
                .build();
        ticketSessionRepository.save(s8);

        // 9. Session 9: CLB Cầu Lông Hoop Heaven - Ngày Kia - CÒN 5 SLOT TRỐNG
        TicketSession s9 = TicketSession.builder()
                .venue(v2)
                .court(c2)
                .playDate(LocalDate.now().plusDays(2))
                .startTime(LocalTime.of(17, 30))
                .endTime(LocalTime.of(19, 30))
                .pricePerTicket(BigDecimal.valueOf(65000))
                .maxSlots(6)
                .bookedSlots(1)
                .sportLevel(SportLevel.WEAK)
                .status(TicketSessionStatus.OPEN)
                .build();
        ticketSessionRepository.save(s9);

        System.out.println("Data Seeder: Đã tạo thành công các ca xé vé đa dạng (nhiều slot trống) vào Database!");
    }

    private void migrateVenueLocations() {
        List<Venue> venues = venueRepository.findAll();
        boolean updatedAny = false;
        for (Venue venue : venues) {
            if (venue.getLocation() != null && !venue.getLocation().trim().isEmpty() &&
                (venue.getProvince() == null || venue.getProvince().trim().isEmpty() ||
                 venue.getDistrict() == null || venue.getDistrict().trim().isEmpty())) {
                
                String location = venue.getLocation();
                String[] parts = location.split(",");
                int len = parts.length;
                
                String addressDetail = "";
                String ward = "";
                String district = "";
                String province = "";
                
                if (len >= 4) {
                    addressDetail = parts[0].trim();
                    ward = parts[1].replaceAll("(?i)^(Phường|Xã|Thị trấn|Thị Trấn)\\s+", "").trim();
                    district = parts[2].replaceAll("(?i)^(Quận|Huyện|Thị xã|Thị Xã|Thành phố|Thành Phố|Tp\\.|TP)\\s+", "").trim();
                    province = parts[3].replaceAll("(?i)^(Tỉnh|Thành phố|Thành Phố|Tp\\.|TP)\\s+", "").trim();
                } else if (len == 3) {
                    addressDetail = parts[0].trim();
                    district = parts[1].replaceAll("(?i)^(Quận|Huyện|Thị xã|Thị Xã|Thành phố|Thành Phố|Tp\\.|TP)\\s+", "").trim();
                    province = parts[2].replaceAll("(?i)^(Tỉnh|Thành phố|Thành Phố|Tp\\.|TP)\\s+", "").trim();
                } else if (len == 2) {
                    addressDetail = parts[0].trim();
                    province = parts[1].replaceAll("(?i)^(Tỉnh|Thành phố|Thành Phố|Tp\\.|TP)\\s+", "").trim();
                } else if (len == 1) {
                    addressDetail = parts[0].trim();
                }
                
                venue.setAddressDetail(addressDetail);
                venue.setWard(ward);
                venue.setDistrict(district);
                venue.setProvince(province);
                
                venueRepository.save(venue);
                updatedAny = true;
                System.out.println("Data Seeder: Đã di chuyển dữ liệu vị trí cho cụm sân '" + venue.getName() + "'");
            }
        }
        if (updatedAny) {
            venueRepository.flush();
        }
    }
}
