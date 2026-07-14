package com.backend.sporta.config;

import com.backend.sporta.entity.Sport;
import com.backend.sporta.entity.User;
import com.backend.sporta.enums.Role;
import com.backend.sporta.entity.UserStatus;
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
