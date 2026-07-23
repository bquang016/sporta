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
import org.springframework.stereotype.Component;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

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

        // Seed Default Owner User
        if (userRepository.findByEmail("owner@sporta.vn").isEmpty()) {
            User ownerUser = User.builder()
                    .email("owner@sporta.vn")
                    .password(passwordEncoder.encode("owner123"))
                    .fullName("Chủ Sân Sporta")
                    .role(Role.OWNER)
                    .status(UserStatus.ACTIVE)
                    .build();
            ownerUser = userRepository.save(ownerUser);
            System.out.println("Data Seeder: Đã tạo tài khoản user xác thực owner (owner@sporta.vn / owner123).");

            Owner ownerProfile = Owner.builder()
                    .user(ownerUser)
                    .fullName("Chủ Sân Sporta")
                    .phoneNumber("0987654321")
                    .dateOfBirth(LocalDate.of(1990, 1, 1))
                    .hometown("Hà Nội")
                    .build();
            ownerProfile = ownerRepository.save(ownerProfile);
            System.out.println("Data Seeder: Đã tạo thông tin hồ sơ Owner chi tiết liên kết tài khoản.");
        }

        // Seed default Player User
        seedPlayerUser();

        // Seed sample Ticket Sessions for User testing
        seedTicketSessions();
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
