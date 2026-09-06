package com.backend.sporta.config;

import com.backend.sporta.entity.*;
import com.backend.sporta.enums.*;
import com.backend.sporta.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired private SportRepository sportRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private UserSportRepository userSportRepository;
    @Autowired private UserWalletRepository userWalletRepository;
    @Autowired private OwnerRepository ownerRepository;
    @Autowired private OwnerRegistrationRepository ownerRegistrationRepository;
    @Autowired private OwnerContractRepository ownerContractRepository;
    @Autowired private OwnerBankAccountRepository ownerBankAccountRepository;
    @Autowired private OwnerWalletRepository ownerWalletRepository;
    @Autowired private VenueRepository venueRepository;
    @Autowired private VenuePolicyRepository venuePolicyRepository;
    @Autowired private VenueImageRepository venueImageRepository;
    @Autowired private CourtRepository courtRepository;
    @Autowired private TicketSessionRepository ticketSessionRepository;
    @Autowired private ClubRepository clubRepository;
    @Autowired private ClubMemberRepository clubMemberRepository;
    @Autowired private VoucherRepository voucherRepository;
    @Autowired private VoucherVenueRepository voucherVenueRepository;
    @Autowired private UserVoucherRepository userVoucherRepository;
    @Autowired private VenueReviewRepository venueReviewRepository;
    @Autowired private LockReasonRepository lockReasonRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println("==================================================================");
        System.out.println("🚀 BẮT ĐẦU QUÁ TRÌNH KHỞI TẠO SIÊU DỮ LIỆU MẪU (DATA SEEDER)...");
        System.out.println("==================================================================");

        // 1. Dọn dẹp các constraint cũ nếu có
        cleanSchemaConstraints();

        // 2. Seed Master Data (Sports, Lock Reasons)
        Map<String, Sport> sports = seedSports();
        seedLockReasons();

        // 3. Seed System Accounts (SuperAdmin, Admin, Dev Tester, Default Owner, Default Player)
        String defaultHashedPassword = passwordEncoder.encode("password123");
        String adminHashedPassword = passwordEncoder.encode("admin123");
        seedCoreAccounts(adminHashedPassword, defaultHashedPassword, sports);

        // 4. Seed Pool 70+ Users (Persona + ELO + Wallets)
        List<User> playerUsers = seedPlayerUsers(defaultHashedPassword, sports);

        // 5. Seed 15+ Owners (CCCD + Contracts + Bank Accounts + Wallets + Registrations)
        List<Owner> owners = seedOwnersAndRegistrations(playerUsers);

        // 6. Seed 24 Cụm sân (Venues + VenuePolicy + Courts + Images + Reviews)
        List<Venue> venues = seedVenuesCourtsAndReviews(owners, playerUsers, sports);

        // 7. Seed 20+ Câu Lạc Bộ (Clubs + Admins + SubLeaders + Members + CRP/ELO)
        seedClubsAndMembers(playerUsers, sports);

        // 8. Seed Vouchers (Toàn hệ thống + Từng cụm sân + Gán ví người dùng)
        seedVouchers(venues, owners, playerUsers);

        // 9. Seed Ticket Sessions (Sân xé vé phân bổ theo ngày & giờ)
        seedTicketSessions(venues);

        System.out.println("==================================================================");
        System.out.println("🎉 HOÀN TẤT KHỞI TẠO TOÀN BỘ DỮ LIỆU MẪU THÀNH CÔNG RỰC RỠ!");
        System.out.println("==================================================================");
    }

    // =========================================================================
    // 1. SCHEMA CONSTRAINTS FIXES
    // =========================================================================
    private void cleanSchemaConstraints() {
        try {
            jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
            jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check");
            jdbcTemplate.execute("ALTER TABLE courts DROP CONSTRAINT IF EXISTS courts_status_check");
            jdbcTemplate.execute("ALTER TABLE match_polls DROP CONSTRAINT IF EXISTS match_polls_status_check");
            jdbcTemplate.execute("ALTER TABLE match_lineups DROP CONSTRAINT IF EXISTS match_lineups_status_check");
            jdbcTemplate.execute("ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check");
            jdbcTemplate.execute("ALTER TABLE venues DROP CONSTRAINT IF EXISTS venues_approval_status_check");
            jdbcTemplate.execute("ALTER TABLE venues DROP CONSTRAINT IF EXISTS venues_status_check");
            jdbcTemplate.execute("ALTER TABLE venues ADD COLUMN IF NOT EXISTS address_detail VARCHAR(255)");
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
            // Ignore constraint cleanup errors
        }
    }

    // =========================================================================
    // 2. MASTER DATA (SPORTS & LOCK REASONS)
    // =========================================================================
    private Map<String, Sport> seedSports() {
        Map<String, Sport> sportMap = new HashMap<>();
        String[] defaultSports = {"Bóng đá", "Cầu lông", "Pickleball", "Bóng rổ"};
        for (String sportName : defaultSports) {
            Sport sport = sportRepository.findByName(sportName).orElseGet(() -> sportRepository.save(new Sport(null, sportName)));
            sportMap.put(sportName, sport);
        }
        return sportMap;
    }

    private void seedLockReasons() {
        if (lockReasonRepository.count() == 0) {
            lockReasonRepository.save(LockReason.builder().role(Role.PLAYER).reasonText("Bom sân / Đặt lịch ảo liên tục không đến.").isDefault(true).build());
            lockReasonRepository.save(LockReason.builder().role(Role.PLAYER).reasonText("Gian lận tài chính / Lợi dụng mã khuyến mãi bất hợp pháp.").isDefault(true).build());
            lockReasonRepository.save(LockReason.builder().role(Role.PLAYER).reasonText("Hành vi phi thể thao / Gây gổ, bạo lực tại sân đấu.").isDefault(true).build());
            lockReasonRepository.save(LockReason.builder().role(Role.PLAYER).reasonText("Spam / Dùng tài khoản giả mạo phá hoại cộng đồng.").isDefault(true).build());

            lockReasonRepository.save(LockReason.builder().role(Role.OWNER).reasonText("Cung cấp thông tin cụm sân giả mạo / Hình ảnh không đúng thực tế.").isDefault(true).build());
            lockReasonRepository.save(LockReason.builder().role(Role.OWNER).reasonText("Tự ý hủy lịch đặt của khách vào giờ chót không có lý do chính đáng.").isDefault(true).build());
            lockReasonRepository.save(LockReason.builder().role(Role.OWNER).reasonText("Gian lận hoa hồng / Ép khách giao dịch ngoài ứng dụng Sporta.").isDefault(true).build());
            lockReasonRepository.save(LockReason.builder().role(Role.OWNER).reasonText("Dịch vụ quá tệ / Bị người chơi khiếu nại nghiêm trọng liên tục.").isDefault(true).build());
        }
    }

    // =========================================================================
    // 3. CORE SYSTEM ACCOUNTS
    // =========================================================================
    private void seedCoreAccounts(String adminPass, String defaultPass, Map<String, Sport> sports) {
        // Super Admin
        if (userRepository.findByEmail("superadmin@sporta.vn").isEmpty()) {
            userRepository.save(User.builder()
                    .email("superadmin@sporta.vn").password(adminPass).fullName("Super Admin")
                    .role(Role.SUPER_ADMIN).status(UserStatus.ACTIVE).gender(Gender.MALE)
                    .phoneNumber("0900000001").build());
        }

        // Admin
        if (userRepository.findByEmail("admin@sporta.vn").isEmpty()) {
            userRepository.save(User.builder()
                    .email("admin@sporta.vn").password(adminPass).fullName("Hệ Thống Admin")
                    .role(Role.ADMIN).status(UserStatus.ACTIVE).gender(Gender.MALE)
                    .phoneNumber("0900000002").build());
        }

        // Dev Tester User
        User devUser = userRepository.findByEmail("dev@sporta.vn").orElseGet(() -> {
            User u = User.builder()
                    .email("dev@sporta.vn").password(defaultPass).fullName("DEV Kỹ Thuật Viên")
                    .phoneNumber("0999999999").gender(Gender.MALE).dateOfBirth(LocalDate.of(1996, 6, 18))
                    .height(178).weight(72.5).role(Role.PLAYER).status(UserStatus.ACTIVE).isDevTester(true)
                    .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80")
                    .build();
            return userRepository.save(u);
        });
        ensureUserWallet(devUser, 10000000L);
        ensureUserSports(devUser, sports, SportLevel.PRO, 2150);

        // Default Player
        User playerUser = userRepository.findByEmail("player@sporta.vn").orElseGet(() -> {
            User u = User.builder()
                    .email("player@sporta.vn").password(defaultPass).fullName("Nguyễn Văn Player")
                    .phoneNumber("0912345678").gender(Gender.MALE).dateOfBirth(LocalDate.of(1998, 4, 12))
                    .height(175).weight(68.0).role(Role.PLAYER).status(UserStatus.ACTIVE).isDevTester(false)
                    .avatarUrl("https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80")
                    .build();
            return userRepository.save(u);
        });
        ensureUserWallet(playerUser, 2500000L);
        ensureUserSports(playerUser, sports, SportLevel.GOOD, 1820);

        // Default Owner
        User ownerUser = userRepository.findByEmail("owner@sporta.vn").orElseGet(() -> {
            User u = User.builder()
                    .email("owner@sporta.vn").password(defaultPass).fullName("Phạm Đức Chủ Sân")
                    .phoneNumber("0987654321").gender(Gender.MALE).dateOfBirth(LocalDate.of(1988, 10, 20))
                    .role(Role.OWNER).status(UserStatus.ACTIVE).isDevTester(false)
                    .avatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80")
                    .build();
            return userRepository.save(u);
        });

        if (ownerRepository.findByUserId(ownerUser.getId()).isEmpty()) {
            Owner o = ownerRepository.save(Owner.builder()
                    .user(ownerUser).fullName(ownerUser.getFullName()).phoneNumber(ownerUser.getPhoneNumber())
                    .gender("Nam").nationality("Việt Nam").dateOfBirth(LocalDate.of(1988, 10, 20))
                    .idNumber("001088012345").hometown("Hà Nội")
                    .permanentAddress("12 Duy Tân, Dịch Vọng Hậu, Cầu Giấy, Hà Nội")
                    .idFrontImage("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80")
                    .idBackImage("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80")
                    .build());
            ensureOwnerWallet(o, 50000000L);
            ensureOwnerBankAccount(o, "VCB", "Ngân hàng Ngoại thương Việt Nam (Vietcombank)", "0011004567890", o.getFullName());
        }
    }

    // =========================================================================
    // 4. GENERATE 70+ PLAYER USERS
    // =========================================================================
    private List<User> seedPlayerUsers(String defaultPass, Map<String, Sport> sports) {
        List<User> existingUsers = userRepository.findAll();
        if (existingUsers.size() >= 50) {
            return existingUsers;
        }

        String[] firstNames = {"Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"};
        String[] middleMale = {"Văn", "Đức", "Thành", "Quang", "Minh", "Tuấn", "Hoàng", "Tiến", "Huy", "Nam", "Duy", "Mạnh"};
        String[] lastMale = {"Hùng", "Cường", "Dũng", "Thắng", "Long", "Bảo", "Kiên", "Hiếu", "Tùng", "Sơn", "Khánh", "Việt", "Phong", "An", "Phúc"};

        String[] middleFemale = {"Thị", "Thu", "Ngọc", "Mai", "Phương", "Thanh", "Mỹ", "Quỳnh", "Hải", "Hồng"};
        String[] lastFemale = {"Trang", "Linh", "Hoa", "Lan", "Hương", "Anh", "Nhi", "Vy", "Hà", "Yến", "Thảo", "Huyền", "Châu", "Ngân"};

        String[] maleAvatars = {
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=250&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=250&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=250&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=250&auto=format&fit=crop&q=80"
        };
        String[] femaleAvatars = {
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=250&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=250&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=250&auto=format&fit=crop&q=80"
        };

        Random rand = new Random(2026);
        List<User> newUsers = new ArrayList<>();

        for (int i = 1; i <= 65; i++) {
            String email = "player" + i + "@sporta.vn";
            if (userRepository.findByEmail(email).isPresent()) continue;

            boolean isMale = (i % 4 != 0); // 75% male, 25% female for sports app
            String fullName;
            String avatar;

            if (isMale) {
                fullName = firstNames[rand.nextInt(firstNames.length)] + " " +
                        middleMale[rand.nextInt(middleMale.length)] + " " +
                        lastMale[rand.nextInt(lastMale.length)];
                avatar = maleAvatars[rand.nextInt(maleAvatars.length)];
            } else {
                fullName = firstNames[rand.nextInt(firstNames.length)] + " " +
                        middleFemale[rand.nextInt(middleFemale.length)] + " " +
                        lastFemale[rand.nextInt(lastFemale.length)];
                avatar = femaleAvatars[rand.nextInt(femaleAvatars.length)];
            }

            int birthYear = 1990 + rand.nextInt(14); // 1990 - 2003
            int birthMonth = 1 + rand.nextInt(12);
            int birthDay = 1 + rand.nextInt(28);

            int height = isMale ? 168 + rand.nextInt(18) : 156 + rand.nextInt(16);
            double weight = isMale ? 60.0 + rand.nextInt(25) : 46.0 + rand.nextInt(18);

            User user = User.builder()
                    .email(email)
                    .password(defaultPass)
                    .fullName(fullName)
                    .phoneNumber("09" + String.format("%08d", 10000000 + i * 137))
                    .gender(isMale ? Gender.MALE : Gender.FEMALE)
                    .dateOfBirth(LocalDate.of(birthYear, birthMonth, birthDay))
                    .height(height)
                    .weight(weight)
                    .role(Role.PLAYER)
                    .status(UserStatus.ACTIVE)
                    .isDevTester(false)
                    .avatarUrl(avatar)
                    .build();

            user = userRepository.save(user);
            newUsers.add(user);

            // User Wallet
            long initialBalance = (100 + rand.nextInt(4000)) * 1000L; // 100k - 4.1tr
            ensureUserWallet(user, initialBalance);

            // User Sports & ELO Rating
            SportLevel[] levels = {SportLevel.WEAK, SportLevel.WEAK_AVERAGE, SportLevel.AVERAGE, SportLevel.AVERAGE_GOOD, SportLevel.GOOD, SportLevel.PRO};
            SportLevel level = levels[rand.nextInt(levels.length)];
            int elo = 900 + rand.nextInt(1200); // 900 - 2100
            ensureUserSports(user, sports, level, elo);
        }

        System.out.println("Data Seeder: Đã khởi tạo thành công " + newUsers.size() + " người chơi (Users & ELO Profiles).");
        return userRepository.findAll();
    }

    private void ensureUserWallet(User user, long balance) {
        if (userWalletRepository.findByUserId(user.getId()).isEmpty()) {
            userWalletRepository.save(UserWallet.builder().user(user).balance(balance).build());
        }
    }

    private void ensureUserSports(User user, Map<String, Sport> sports, SportLevel level, int elo) {
        if (userSportRepository.findByUserId(user.getId()).isEmpty()) {
            Random r = new Random();
            for (Sport sport : sports.values()) {
                if (r.nextBoolean() || sport.getName().equals("Bóng đá")) {
                    userSportRepository.save(UserSport.builder()
                            .user(user).sport(sport).level(level).eloRating(elo)
                            .eloStatus(EloStatus.VERIFIED).placementMatchesPlayed(10)
                            .totalRankedMatches(15 + r.nextInt(30)).totalWins(8 + r.nextInt(20))
                            .lastMatchAt(LocalDateTime.now().minusDays(r.nextInt(10)))
                            .build());
                }
            }
        }
    }

    // =========================================================================
    // 5. GENERATE 15+ OWNERS & REGISTRATIONS
    // =========================================================================
    private List<Owner> seedOwnersAndRegistrations(List<User> users) {
        List<Owner> existingOwners = ownerRepository.findAll();
        if (existingOwners.size() >= 12) {
            return existingOwners;
        }

        String[] banks = {"VCB", "MBB", "TCB", "BIDV", "ACB", "VPB"};
        String[] bankNames = {
                "Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)",
                "Ngân hàng TMCP Quân đội (MB Bank)",
                "Ngân hàng TMCP Kỹ thương Việt Nam (Techcombank)",
                "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)",
                "Ngân hàng TMCP Á Châu (ACB)",
                "Ngân hàng TMCP Việt Nam Thịnh Vượng (VPBank)"
        };

        String[] districts = {"Cầu Giấy", "Nam Từ Liêm", "Bắc Từ Liêm", "Thanh Xuân", "Đống Đa", "Tây Hồ", "Ba Đình", "Hai Bà Trưng", "Hà Đông", "Hoàng Mai"};
        Random rand = new Random(2026);
        List<Owner> createdOwners = new ArrayList<>(existingOwners);

        // Pick 15 users to become Owners
        int ownerCount = Math.min(users.size(), 16);
        for (int i = 0; i < ownerCount; i++) {
            User u = users.get(i);
            if (ownerRepository.findByUserId(u.getId()).isPresent()) continue;

            u.setRole(Role.OWNER);
            userRepository.save(u);

            String dist = districts[i % districts.length];
            Owner owner = ownerRepository.save(Owner.builder()
                    .user(u).fullName(u.getFullName()).phoneNumber(u.getPhoneNumber())
                    .gender(u.getGender() == Gender.FEMALE ? "Nữ" : "Nam").nationality("Việt Nam")
                    .dateOfBirth(u.getDateOfBirth() != null ? u.getDateOfBirth() : LocalDate.of(1985, 5, 10))
                    .idNumber("0010" + String.format("%08d", 80000000 + i * 271))
                    .hometown("Thành phố Hà Nội")
                    .permanentAddress("Số " + (10 + i * 3) + " Đường Phố, Phường Trung Hòa, Quận " + dist + ", Hà Nội")
                    .idFrontImage("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80")
                    .idBackImage("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80")
                    .build());

            createdOwners.add(owner);

            // Owner Wallet & Bank
            ensureOwnerWallet(owner, (5000 + rand.nextInt(45000)) * 10000L); // 50tr - 500tr
            int bankIdx = rand.nextInt(banks.length);
            ensureOwnerBankAccount(owner, banks[bankIdx], bankNames[bankIdx], "190" + String.format("%09d", 100000000 + i * 997), owner.getFullName());

            // Owner Registration (12 APPROVED, 3 PENDING, 1 REJECTED)
            RegistrationStatus status = (i < 12) ? RegistrationStatus.APPROVED : (i < 15 ? RegistrationStatus.PENDING : RegistrationStatus.REJECTED);
            ownerRegistrationRepository.save(OwnerRegistration.builder()
                    .email("owner_reg_" + i + "@sporta.vn")
                    .fullName(owner.getFullName())
                    .phoneNumber(owner.getPhoneNumber())
                    .idNumber(owner.getIdNumber())
                    .gender(owner.getGender())
                    .nationality(owner.getNationality())
                    .hometown(owner.getHometown())
                    .permanentAddress(owner.getPermanentAddress())
                    .idFrontImage(owner.getIdFrontImage())
                    .idBackImage(owner.getIdBackImage())
                    .venueName("Cụm Sân Thể Thao " + owner.getFullName())
                    .province("Thành phố Hà Nội")
                    .district(dist)
                    .ward("Phường Dịch Vọng")
                    .addressDetail("Số " + (10 + i * 3) + " Đường Phố")
                    .status(status)
                    .rejectionReason(status == RegistrationStatus.REJECTED ? "Giấy phép kinh doanh cơ sở thể thao chưa được công chứng." : null)
                    .isContractSigned(status == RegistrationStatus.APPROVED)
                    .signatureIp("118.70.124." + (10 + i))
                    .signatureTimestamp(LocalDateTime.now().minusDays(15 - i))
                    .build());
        }

        System.out.println("Data Seeder: Đã khởi tạo " + createdOwners.size() + " Chủ sân (Owners, Pháp lý & Đơn đăng ký).");
        return createdOwners;
    }

    private void ensureOwnerWallet(Owner owner, long balance) {
        if (ownerWalletRepository.findByOwnerId(owner.getId()).isEmpty()) {
            ownerWalletRepository.save(OwnerWallet.builder()
                    .owner(owner).balance(balance).totalEarned(balance + 20000000L).totalCommission(3000000L).build());
        }
    }

    private void ensureOwnerBankAccount(Owner owner, String code, String name, String num, String accName) {
        if (ownerBankAccountRepository.findByOwnerIdOrderByCreatedAtDesc(owner.getId()).isEmpty()) {
            ownerBankAccountRepository.save(OwnerBankAccount.builder()
                    .owner(owner).bankCode(code).bankName(name).accountNumber(num).accountName(accName).isDefault(true).build());
        }
    }

    // =========================================================================
    // 6. GENERATE 24 VENUES + COURTS + POLICIES + REVIEWS
    // =========================================================================
    private List<Venue> seedVenuesCourtsAndReviews(List<Owner> owners, List<User> players, Map<String, Sport> sports) {
        List<Venue> existingVenues = venueRepository.findAll();
        if (existingVenues.size() >= 20) {
            return existingVenues;
        }

        // Venue Data Blueprint (24 High-Quality Real Venues across Hanoi)
        Object[][] venueData = {
                // Name, Sport, District, Lat, Lng, CoverImage, Address
                {"Sân Bóng Đá Green Field Duy Tân", "Bóng đá", "Cầu Giấy", 21.0315, 105.7832, "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80", "12 Duy Tân, Dịch Vọng Hậu"},
                {"CLB Cầu Lông Hoop Heaven Park", "Cầu lông", "Thanh Xuân", 21.0042, 105.8051, "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80", "34 Lê Văn Lương, Nhân Chính"},
                {"Tổ Hợp Pickleball CMC Complex", "Pickleball", "Cầu Giấy", 21.0368, 105.7821, "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80", "Khu Đô Thị CMC, Dịch Vọng Hậu"},
                {"Sân Bóng Rổ & Bóng Đá Tây Hồ Arena", "Bóng rổ", "Tây Hồ", 21.0601, 105.8190, "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80", "28 Xuân Diệu, Quảng An"},
                {"Trung Tâm Thể Thao Mỹ Đình Star", "Bóng đá", "Nam Từ Liêm", 21.0205, 105.7650, "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80", "Đường Lê Đức Thọ, Mỹ Đình 1"},
                {"Sân Cầu Lông Victor Pro Đống Đa", "Cầu lông", "Đống Đa", 21.0185, 105.8270, "https://images.unsplash.com/photo-1613918108466-292b78a8ef95?w=800&auto=format&fit=crop&q=80", "180 Nguyễn Lương Bằng, Quang Trung"},
                {"Pickleball & Tennis Ba Đình Court", "Pickleball", "Ba Đình", 21.0340, 105.8200, "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&auto=format&fit=crop&q=80", "55 Đốc Ngữ, Liễu Giai"},
                {"Sân Bóng Đá Cỏ Nhân Tạo Hà Đông", "Bóng đá", "Hà Đông", 20.9720, 105.7750, "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop&q=80", "Khu Đấu Giá Vạn Phúc, Vạn Phúc"},
                {"CLB Cầu Lông Cầu Giấy Smashers", "Cầu lông", "Cầu Giấy", 21.0380, 105.7920, "https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=800&auto=format&fit=crop&q=80", "35 Trần Thái Tông, Dịch Vọng"},
                {"Sân Bóng Rổ Dunkers Arena Hai Bà Trưng", "Bóng rổ", "Hai Bà Trưng", 21.0080, 105.8500, "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&auto=format&fit=crop&q=80", "42 Võ Thị Sáu, Thanh Nhàn"},
                {"Tổ Hợp Thể Thao Hoàng Mai MultiSport", "Bóng đá", "Hoàng Mai", 20.9800, 105.8450, "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&auto=format&fit=crop&q=80", "Linh Đàm, Hoàng Liệt"},
                {"Sân Pickleball Royal City", "Pickleball", "Thanh Xuân", 21.0020, 105.8150, "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&auto=format&fit=crop&q=80", "72A Nguyễn Trãi, Thượng Đình"},
                {"CLB Cầu Lông Bắc Từ Liêm Shuttle", "Cầu lông", "Bắc Từ Liêm", 21.0500, 105.7550, "https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=800&auto=format&fit=crop&q=80", "Đường Phú Diễn, Phú Diễn"},
                {"Sân Bóng Đá PVV Sông Đà", "Bóng đá", "Nam Từ Liêm", 21.0150, 105.7800, "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop&q=80", "Phạm Hùng, Mễ Trì"},
                {"Sân Pickleball Flamingo Tây Hồ", "Pickleball", "Tây Hồ", 21.0650, 105.8250, "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80", "Đường Lạc Long Quân, Nhật Tân"},
                {"Sân Bóng Rổ Bách Khoa Arena", "Bóng rổ", "Hai Bà Trưng", 21.0050, 105.8420, "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80", "Tạ Quang Bửu, Bách Khoa"},
                {"CLB Cầu Lông Yonex Hào Nam", "Cầu lông", "Đống Đa", 21.0250, 105.8250, "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80", "86 Hào Nam, Ô Chợ Dừa"},
                {"Sân Bóng Đá Chu Văn An", "Bóng đá", "Tây Hồ", 21.0420, 105.8300, "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80", "Thụy Khuê, Thụy Khuê"},
                {"Tổ Hợp Thể Thao Long Biên Center", "Pickleball", "Hoàng Mai", 20.9900, 105.8600, "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80", "Tam Trinh, Mai Động"},
                {"Sân Bóng Đá Trung Kính Sport", "Bóng đá", "Cầu Giấy", 21.0220, 105.7900, "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80", "Trung Kính, Yên Hòa"}
        };

        String[] sampleReviews = {
                "Mặt sân chất lượng cao, cỏ mới thay rất êm chân, hệ thống đèn chiếu sáng ban đêm cực kỳ tốt!",
                "Sân cầu lông thảm chuẩn quốc tế, trần cao thoáng gió, nước uống và đồ ăn nhẹ đầy đủ.",
                "Pickleball ở đây chơi rất đã, có mái che không sợ nắng mưa, anh em chủ sân nhiệt tình vui vẻ 5 sao!",
                "Cơ sở vật chất khang trang, phòng thay đồ và vệ sinh sạch sẽ, chỗ để xe ô tô xe máy thoải mái.",
                "Giá cả hợp lý so với mặt bằng chung, nhân viên hỗ trợ đặt sân và cho thuê dụng cụ rất nhanh nhẹn.",
                "Sân đẹp, vị trí trung tâm dễ tìm, lần sau sẽ rủ anh em công ty tiếp tục quay lại giao lưu!"
        };

        Random rand = new Random(2026);
        List<Venue> createdVenues = new ArrayList<>(existingVenues);

        for (int i = 0; i < venueData.length; i++) {
            String name = (String) venueData[i][0];
            String sportName = (String) venueData[i][1];
            String district = (String) venueData[i][2];
            double lat = (Double) venueData[i][3];
            double lng = (Double) venueData[i][4];
            String cover = (String) venueData[i][5];
            String address = (String) venueData[i][6];

            if (venueRepository.findAll().stream().anyMatch(v -> v.getName().equals(name))) {
                continue;
            }

            Owner owner = owners.get(i % owners.size());
            Sport sport = sports.getOrDefault(sportName, sports.get("Bóng đá"));

            int subCourts = 3 + rand.nextInt(4); // 3 - 6 sub-courts
            double minP = 120000.0 + rand.nextInt(10) * 10000.0;
            double maxP = minP + 150000.0 + rand.nextInt(10) * 10000.0;

            Venue venue = Venue.builder()
                    .owner(owner)
                    .name(name)
                    .sport(sport)
                    .sportTypes(sportName)
                    .province("Thành phố Hà Nội")
                    .district(district)
                    .ward("Phường Trung Tâm")
                    .addressDetail(address)
                    .location(address + ", " + district + ", Hà Nội")
                    .latitude(lat)
                    .longitude(lng)
                    .subCourtCount(subCourts)
                    .openingTime(LocalTime.of(6, 0))
                    .closingTime(LocalTime.of(23, 0))
                    .shiftDurationMinutes(30)
                    .coverImage(cover)
                    .description("Tổ hợp thể thao tiêu chuẩn chất lượng cao, phục vụ cộng đồng đam mê " + sportName + " với đầy đủ tiện ích hiện đại.")
                    .hasSurcharge(rand.nextBoolean())
                    .surchargeAmount(50000.0)
                    .surchargeDescription("Phụ thu bật đèn chiếu sáng ban đêm từ 18:00 - 22:30.")
                    .status(VenueStatus.ACTIVE)
                    .approvalStatus(ApprovalStatus.APPROVED)
                    .minPrice(minP)
                    .maxPrice(maxP)
                    .averageRating(4.7 + rand.nextDouble() * 0.3) // 4.7 - 5.0
                    .totalReviews(18 + rand.nextInt(45))
                    .build();

            venue = venueRepository.save(venue);
            createdVenues.add(venue);

            // 1. Venue Policy
            venuePolicyRepository.save(VenuePolicy.builder()
                    .venue(venue)
                    .freeCancellationHours(rand.nextBoolean() ? 24 : 12)
                    .lateCancellationRefundRate(rand.nextBoolean() ? 80 : 50)
                    .rainRescheduleAllowed(true)
                    .build());

            // 2. Sub Courts
            for (int c = 1; c <= subCourts; c++) {
                courtRepository.save(Court.builder()
                        .venue(venue)
                        .name("Sân " + (sportName.equals("Bóng đá") ? "7 - Sân A" : "Số ") + c)
                        .price(minP + (c - 1) * 30000.0)
                        .status(CourtStatus.ACTIVE)
                        .build());
            }

            // 3. Venue Review Records (Chỉ có nhận xét của User, KHÔNG có ownerReply)
            int reviewCount = 3 + rand.nextInt(4); // 3 - 6 reviews per venue
            for (int r = 0; r < reviewCount; r++) {
                User reviewer = players.get((i * 3 + r) % players.size());
                if (venueReviewRepository.findFirstByVenueIdAndUserIdAndIsDeletedFalseOrderByCreatedAtDesc(venue.getId(), reviewer.getId()).isEmpty()) {
                    venueReviewRepository.save(VenueReview.builder()
                            .venue(venue)
                            .user(reviewer)
                            .rating(rand.nextInt(10) > 2 ? 5 : 4) // 80% 5 sao, 20% 4 sao
                            .comment(sampleReviews[rand.nextInt(sampleReviews.length)])
                            .isDeleted(false)
                            .build());
                }
            }

            // 4. Owner Contract for this venue
            if (!ownerContractRepository.existsByVenueId(venue.getId())) {
                ownerContractRepository.save(OwnerContract.builder()
                        .owner(owner)
                        .venue(venue)
                        .contractCode("HD-SPORTA-2026/" + String.format("%04d", i + 1))
                        .digitalSignatureHash(UUID.randomUUID().toString())
                        .signedIpAddress("118.70.124." + (20 + i))
                        .signedAt(LocalDateTime.now().minusDays(30 - i))
                        .status(ContractStatus.ACTIVE)
                        .build());
            }
        }

        System.out.println("Data Seeder: Đã khởi tạo " + createdVenues.size() + " Cụm sân (Venues, Courts, Policies, Reviews & Hợp đồng).");
        return createdVenues;
    }

    // =========================================================================
    // 7. GENERATE 20 CLUBS WITH MEMBERS & CRP/ELO
    // =========================================================================
    private void seedClubsAndMembers(List<User> players, Map<String, Sport> sports) {
        if (clubRepository.count() >= 15) return;

        String[] clubNames = {
                "FC Sporta Cầu Giấy", "CLB Cầu Lông Smash Champions", "Pickleball Master Hà Nội", "Hà Nội Dunkers Basketball",
                "FC Bách Khoa Warriors", "CLB Cầu Lông Thanh Xuân Pro", "Pickleball Royal Club", "Tây Hồ Basketball Club",
                "FC Thăng Long Brothers", "CLB Cầu Lông Dịch Vọng Hậu", "Pickleball Ba Đình Star", "Hai Bà Trưng Hoop Club",
                "FC Tuổi Trẻ Hà Đông", "CLB Cầu Lông Mỹ Đình", "Pickleball Flamingo", "Hoàng Mai AllStars FC"
        };

        String[] clubAvatars = {
                "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=300&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=300&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=300&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&auto=format&fit=crop&q=80"
        };

        String[] areas = {"Cầu Giấy, Hà Nội", "Thanh Xuân, Hà Nội", "Tây Hồ, Hà Nội", "Nam Từ Liêm, Hà Nội", "Đống Đa, Hà Nội", "Hà Đông, Hà Nội"};
        Random rand = new Random(2026);
        List<Sport> sportList = new ArrayList<>(sports.values());

        for (int i = 0; i < clubNames.length; i++) {
            String name = clubNames[i];
            if (clubRepository.findAll().stream().anyMatch(c -> c.getName().equals(name))) continue;

            Sport sport = sportList.get(i % sportList.size());
            User creator = players.get(i % players.size());
            int clubElo = 1150 + rand.nextInt(650); // 1150 - 1800

            Club club = clubRepository.save(Club.builder()
                    .name(name)
                    .sport(sport)
                    .creator(creator)
                    .elo(clubElo)
                    .area(areas[i % areas.length])
                    .activityLevel("Hoạt động hàng tuần")
                    .description("Câu lạc bộ thể thao phong trào giao lưu, ghép trận và nâng cao kỹ năng.")
                    .avatarImage(clubAvatars[i % clubAvatars.length])
                    .maxMembers(50)
                    .build());

            // 1. Creator as ADMIN
            clubMemberRepository.save(ClubMember.builder()
                    .club(club).user(creator).role(ClubMemberRole.ADMIN).status(ClubMemberStatus.APPROVED).build());

            // 2. 1-2 Sub Leaders
            User subLeader = players.get((i + 5) % players.size());
            if (!subLeader.getId().equals(creator.getId())) {
                clubMemberRepository.save(ClubMember.builder()
                        .club(club).user(subLeader).role(ClubMemberRole.SUB_LEADER).status(ClubMemberStatus.APPROVED).build());
            }

            // 3. 5 - 12 Members
            int memberCount = 6 + rand.nextInt(7);
            for (int m = 1; m <= memberCount; m++) {
                User member = players.get((i * 7 + m) % players.size());
                if (clubMemberRepository.findByClubIdAndUserId(club.getId(), member.getId()).isEmpty()) {
                    clubMemberRepository.save(ClubMember.builder()
                            .club(club).user(member).role(ClubMemberRole.MEMBER).status(ClubMemberStatus.APPROVED).build());
                }
            }
        }

        System.out.println("Data Seeder: Đã khởi tạo các Câu Lạc Bộ (Clubs, Admins, SubLeaders & Danh sách thành viên).");
    }

    // =========================================================================
    // 8. GENERATE VOUCHERS (SYSTEM + VENUE-SPECIFIC + USER WALLET)
    // =========================================================================
    private void seedVouchers(List<Venue> venues, List<Owner> owners, List<User> users) {
        if (voucherRepository.count() >= 10) return;

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endOfYear = LocalDateTime.of(2026, 12, 31, 23, 59, 59);

        // A. SYSTEM VOUCHERS
        Object[][] systemVouchers = {
                {"SPORTA50K", "Giảm 50K Toàn Sàn", DiscountType.FIXED_AMOUNT, 50000.0, null, 200000.0, 500},
                {"CHAOMUNG2026", "Chào Mừng Thành Viên Mới - Giảm 20%", DiscountType.PERCENTAGE, 20.0, 100000.0, 0.0, 1000},
                {"WEEKENDVIBES", "Cuối Tuần Năng Động - Giảm 30K", DiscountType.FIXED_AMOUNT, 30000.0, null, 150000.0, 300},
                {"PICKLEMASTER", "Đam Mê Pickleball - Giảm 15%", DiscountType.PERCENTAGE, 15.0, 80000.0, 100000.0, 400},
                {"NIGHTOWL", "Cú Đêm Thể Thao - Giảm 40K", DiscountType.FIXED_AMOUNT, 40000.0, null, 180000.0, 200},
                {"SPORTAPAY", "Ưu Đãi Ví Sporta - Giảm 10%", DiscountType.PERCENTAGE, 10.0, 50000.0, 50000.0, 500}
        };

        List<Voucher> createdVouchers = new ArrayList<>();

        for (Object[] sv : systemVouchers) {
            String code = (String) sv[0];
            if (voucherRepository.existsByCodeIgnoreCase(code)) continue;

            Voucher v = voucherRepository.save(Voucher.builder()
                    .code(code)
                    .name((String) sv[1])
                    .discountType((DiscountType) sv[2])
                    .discountValue((Double) sv[3])
                    .maxDiscountAmount((Double) sv[4])
                    .minOrderAmount((Double) sv[5])
                    .totalQuantity((Integer) sv[6])
                    .collectedQuantity(35)
                    .usedQuantity(12)
                    .voucherScope(VoucherScope.SYSTEM)
                    .status(VoucherStatus.ACTIVE)
                    .startDate(now.minusDays(5))
                    .endDate(endOfYear)
                    .bannerImageUrl("https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&auto=format&fit=crop&q=80")
                    .build());
            createdVouchers.add(v);
        }

        // B. VENUE-SPECIFIC VOUCHERS
        for (int i = 0; i < Math.min(venues.size(), 8); i++) {
            Venue venue = venues.get(i);
            String code = "VOUCHER_" + (i + 1) + "_" + venue.getDistrict().toUpperCase().replace(" ", "");
            if (voucherRepository.existsByCodeIgnoreCase(code)) continue;

            Voucher vv = Voucher.builder()
                    .code(code)
                    .name("Ưu Đãi " + venue.getName() + " - Giảm 20K")
                    .discountType(DiscountType.FIXED_AMOUNT)
                    .discountValue(20000.0)
                    .minOrderAmount(100000.0)
                    .totalQuantity(100)
                    .collectedQuantity(15)
                    .usedQuantity(4)
                    .voucherScope(VoucherScope.VENUE)
                    .owner(venue.getOwner())
                    .status(VoucherStatus.ACTIVE)
                    .startDate(now.minusDays(3))
                    .endDate(endOfYear)
                    .build();

            vv = voucherRepository.save(vv);
            voucherVenueRepository.save(VoucherVenue.builder().voucher(vv).venue(venue).build());
            createdVouchers.add(vv);
        }

        // C. Assign Vouchers to Core Test Users (dev@sporta.vn & player@sporta.vn)
        User devUser = userRepository.findByEmail("dev@sporta.vn").orElse(null);
        User playerUser = userRepository.findByEmail("player@sporta.vn").orElse(null);

        for (Voucher v : createdVouchers) {
            if (devUser != null && userVoucherRepository.findByUserIdAndVoucherId(devUser.getId(), v.getId()).isEmpty()) {
                userVoucherRepository.save(UserVoucher.builder()
                        .user(devUser).voucher(v).status(UserVoucherStatus.COLLECTED).collectedAt(now.minusDays(1)).build());
            }
            if (playerUser != null && userVoucherRepository.findByUserIdAndVoucherId(playerUser.getId(), v.getId()).isEmpty()) {
                userVoucherRepository.save(UserVoucher.builder()
                        .user(playerUser).voucher(v).status(UserVoucherStatus.COLLECTED).collectedAt(now.minusDays(2)).build());
            }
        }

        System.out.println("Data Seeder: Đã khởi tạo danh sách Voucher toàn sàn, Voucher cụm sân và gán vào Ví người dùng.");
    }

    // =========================================================================
    // 9. GENERATE TICKET SESSIONS (SÂN XÉ VÉ)
    // =========================================================================
    private void seedTicketSessions(List<Venue> venues) {
        if (ticketSessionRepository.count() >= 15) return;

        LocalDate today = LocalDate.now();
        Random rand = new Random(2026);

        LocalTime[][] slots = {
                {LocalTime.of(6, 0), LocalTime.of(8, 0)},
                {LocalTime.of(17, 30), LocalTime.of(19, 30)},
                {LocalTime.of(19, 30), LocalTime.of(21, 30)},
                {LocalTime.of(20, 0), LocalTime.of(22, 0)}
        };

        for (int i = 0; i < Math.min(venues.size(), 12); i++) {
            Venue venue = venues.get(i);
            List<Court> courts = courtRepository.findByVenueId(venue.getId());
            if (courts.isEmpty()) continue;

            Court court = courts.get(0);

            for (int dayOffset = 0; dayOffset <= 3; dayOffset++) {
                LocalDate playDate = today.plusDays(dayOffset);
                LocalTime[] slot = slots[(i + dayOffset) % slots.length];

                ticketSessionRepository.save(TicketSession.builder()
                        .venue(venue)
                        .court(court)
                        .playDate(playDate)
                        .startTime(slot[0])
                        .endTime(slot[1])
                        .pricePerTicket(BigDecimal.valueOf(45000 + rand.nextInt(5) * 10000))
                        .maxSlots(14)
                        .bookedSlots(3 + rand.nextInt(7))
                        .sportLevel(rand.nextBoolean() ? SportLevel.AVERAGE : SportLevel.GOOD)
                        .hasHostTeam(rand.nextBoolean())
                        .hostTeamName(rand.nextBoolean() ? "FC Chiến Binh Sporta" : null)
                        .status(TicketSessionStatus.OPEN)
                        .build());
            }
        }

        System.out.println("Data Seeder: Đã khởi tạo thành công các phiên Sân Xé Vé (Ticket Sessions) theo lịch.");
    }
}
