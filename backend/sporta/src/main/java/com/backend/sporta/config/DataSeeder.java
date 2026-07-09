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

    @Override
    public void run(String... args) throws Exception {
        // Fix for "users_role_check" constraint when adding new Roles
        try {
            jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
        } catch (Exception e) {
            System.out.println("Data Seeder: Bỏ qua việc xóa constraint users_role_check (có thể không tồn tại).");
        }

        // Fix for "venues_approval_status_check" constraint when adding DRAFT approval status
        try {
            jdbcTemplate.execute("ALTER TABLE venues DROP CONSTRAINT IF EXISTS venues_approval_status_check");
        } catch (Exception e) {
            System.out.println("Data Seeder: Bỏ qua việc xóa constraint venues_approval_status_check (có thể không tồn tại).");
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

            Sport bongDa = sportRepository.findByName("Bóng đá").orElse(null);
            Sport cauLong = sportRepository.findByName("Cầu lông").orElse(null);
            Sport pickleball = sportRepository.findByName("Pickleball").orElse(null);

            // Seed Venues for this Owner
            Venue venueCauGiay = null;
            Venue venueQuan7 = null;
            Venue venueBaDinh = null;
            if (venueRepository.count() == 0 && ownerProfile != null) {
                venueCauGiay = Venue.builder()
                        .owner(ownerProfile)
                        .name("Cụm sân Cầu Giấy")
                        .location("15 Dịch Vọng Hậu, Dịch Vọng Hậu, Cầu Giấy, Hà Nội")
                        .province("Hà Nội")
                        .district("Cầu Giấy")
                        .ward("Dịch Vọng Hậu")
                        .addressDetail("15 Dịch Vọng Hậu")
                        .latitude(21.0285)
                        .longitude(105.7801)
                        .description("Tổ hợp thể thao Cầu Giấy với 4 sân bóng đá mini và 6 sân cầu lông.")
                        .openingTime(LocalTime.of(6, 0))
                        .closingTime(LocalTime.of(23, 0))
                        .shiftDurationMinutes(60)
                        .sport(bongDa)
                        .coverImage("https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop")
                        .approvalStatus(ApprovalStatus.APPROVED)
                        .build();
                venueCauGiay = venueRepository.save(venueCauGiay);

                venueImageRepository.save(VenueImage.builder().venue(venueCauGiay).imageUrl("https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=600&auto=format&fit=crop").build());
                venueImageRepository.save(VenueImage.builder().venue(venueCauGiay).imageUrl("https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=600&auto=format&fit=crop").build());

                venueQuan7 = Venue.builder()
                        .owner(ownerProfile)
                        .name("Cụm sân Quận 7")
                        .location("45 Nguyễn Văn Linh, Tân Phong, Quận 7, TP. Hồ Chí Minh")
                        .province("Hồ Chí Minh")
                        .district("Quận 7")
                        .ward("Tân Phong")
                        .addressDetail("45 Nguyễn Văn Linh")
                        .latitude(10.7326)
                        .longitude(106.7268)
                        .description("Cụm sân Pickleball trong nhà hiện đại và cao cấp nhất khu vực Nam Sài Gòn.")
                        .openingTime(LocalTime.of(5, 0))
                        .closingTime(LocalTime.of(22, 0))
                        .shiftDurationMinutes(60)
                        .sport(pickleball)
                        .coverImage("https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=600&auto=format&fit=crop")
                        .approvalStatus(ApprovalStatus.APPROVED)
                        .build();
                venueQuan7 = venueRepository.save(venueQuan7);

                venueImageRepository.save(VenueImage.builder().venue(venueQuan7).imageUrl("https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=600&auto=format&fit=crop").build());

                venueBaDinh = Venue.builder()
                        .owner(ownerProfile)
                        .name("Cụm sân Ba Đình")
                        .location("34 Hoàng Hoa Thám, Hoàng Hoa Thám, Ba Đình, Hà Nội")
                        .province("Hà Nội")
                        .district("Ba Đình")
                        .ward("Hoàng Hoa Thám")
                        .addressDetail("34 Hoàng Hoa Thám")
                        .latitude(21.0396)
                        .longitude(105.8159)
                        .description("Khu phức hợp thể thao ngoài trời Ba Đình.")
                        .openingTime(LocalTime.of(6, 0))
                        .closingTime(LocalTime.of(22, 0))
                        .shiftDurationMinutes(60)
                        .sport(cauLong)
                        .coverImage("https://images.unsplash.com/photo-1613918431201-f2f27ddc5ca7?q=80&w=600&auto=format&fit=crop")
                        .approvalStatus(ApprovalStatus.APPROVED)
                        .build();
                venueBaDinh = venueRepository.save(venueBaDinh);

                venueImageRepository.save(VenueImage.builder().venue(venueBaDinh).imageUrl("https://images.unsplash.com/photo-1521537634581-0dccd2ece234?q=80&w=600&auto=format&fit=crop").build());

                System.out.println("Data Seeder: Đã tạo các cụm sân (Venue) mẫu.");
            } else if (ownerProfile != null) {
                List<Venue> venues = venueRepository.findByOwnerUserEmail("owner@sporta.vn");
                for (Venue v : venues) {
                    if (v.getName().equals("Cụm sân Cầu Giấy")) venueCauGiay = v;
                    if (v.getName().equals("Cụm sân Quận 7")) venueQuan7 = v;
                    if (v.getName().equals("Cụm sân Ba Đình")) venueBaDinh = v;
                }
            }

            // Seed Courts for this Owner
            if (courtRepository.count() == 0 && ownerProfile != null) {
                // Court 1: Bóng đá
                if (venueCauGiay != null) {
                    Court court1 = Court.builder()
                            .name("Cụm Sân Bóng Đá Sporta Cầu Giấy")
                            .price(150000.0)
                            .venue(venueCauGiay)
                            .status(CourtStatus.ACTIVE)
                            .build();
                    courtRepository.save(court1);
                }

                // Court 2: Pickleball
                if (venueQuan7 != null) {
                    Court court2 = Court.builder()
                            .name("Cụm Sân Pickleball Sporta Quận 7")
                            .price(250000.0)
                            .venue(venueQuan7)
                            .status(CourtStatus.ACTIVE)
                            .build();
                    courtRepository.save(court2);
                }

                // Court 3: Cầu lông
                if (venueCauGiay != null) {
                    Court court3 = Court.builder()
                            .name("Sân Cầu Lông Sporta Thanh Xuân")
                            .price(80000.0)
                            .venue(venueCauGiay)
                            .status(CourtStatus.ACTIVE)
                            .build();
                    courtRepository.save(court3);
                }

                // Court 4: Cầu lông Ba Đình
                if (venueBaDinh != null) {
                    Court court4 = Court.builder()
                            .name("Sân Cầu Lông Sporta Ba Đình")
                            .price(90000.0)
                            .venue(venueBaDinh)
                            .status(CourtStatus.MAINTENANCE)
                            .build();
                    courtRepository.save(court4);
                }
                System.out.println("Data Seeder: Đã thêm các sân bãi mẫu.");
            }
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
