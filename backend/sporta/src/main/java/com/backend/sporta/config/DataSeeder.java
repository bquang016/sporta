package com.backend.sporta.config;

import com.backend.sporta.entity.Sport;
import com.backend.sporta.entity.User;
import com.backend.sporta.enums.Role;
import com.backend.sporta.entity.UserStatus;
import com.backend.sporta.entity.Owner;
import com.backend.sporta.entity.Court;
import com.backend.sporta.entity.CourtImage;
import com.backend.sporta.enums.CourtStatus;
import com.backend.sporta.repository.SportRepository;
import com.backend.sporta.entity.Venue;
import com.backend.sporta.repository.VenueRepository;
import com.backend.sporta.repository.UserRepository;
import com.backend.sporta.repository.OwnerRepository;
import com.backend.sporta.repository.CourtRepository;
import com.backend.sporta.repository.CourtImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDate;

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
    private CourtImageRepository courtImageRepository;

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

            // Seed Venues for this Owner
            Venue venueCauGiay = null;
            Venue venueQuan7 = null;
            Venue venueBaDinh = null;
            if (venueRepository.count() == 0 && ownerProfile != null) {
                venueCauGiay = Venue.builder()
                        .owner(ownerProfile)
                        .name("Cụm sân Cầu Giấy")
                        .location("15 Dịch Vọng Hậu, Cầu Giấy, Hà Nội")
                        .description("Tổ hợp thể thao Cầu Giấy với 4 sân bóng đá mini và 6 sân cầu lông.")
                        .build();
                venueCauGiay = venueRepository.save(venueCauGiay);

                venueQuan7 = Venue.builder()
                        .owner(ownerProfile)
                        .name("Cụm sân Quận 7")
                        .location("45 Nguyễn Văn Linh, Tân Phong, Quận 7, TP. Hồ Chí Minh")
                        .description("Cụm sân Pickleball trong nhà hiện đại và cao cấp nhất khu vực Nam Sài Gòn.")
                        .build();
                venueQuan7 = venueRepository.save(venueQuan7);

                venueBaDinh = Venue.builder()
                        .owner(ownerProfile)
                        .name("Cụm sân Ba Đình")
                        .location("34 Hoàng Hoa Thám, Ba Đình, Hà Nội")
                        .description("Khu phức hợp thể thao ngoài trời Ba Đình.")
                        .build();
                venueBaDinh = venueRepository.save(venueBaDinh);
                System.out.println("Data Seeder: Đã tạo các cụm sân (Venue) mẫu.");
            } else if (ownerProfile != null) {
                java.util.List<Venue> venues = venueRepository.findByOwnerUserEmail("owner@sporta.vn");
                for (Venue v : venues) {
                    if (v.getName().equals("Cụm sân Cầu Giấy")) venueCauGiay = v;
                    if (v.getName().equals("Cụm sân Quận 7")) venueQuan7 = v;
                    if (v.getName().equals("Cụm sân Ba Đình")) venueBaDinh = v;
                }
            }

            // Seed Courts for this Owner
            Sport bongDa = sportRepository.findByName("Bóng đá").orElse(null);
            Sport cauLong = sportRepository.findByName("Cầu lông").orElse(null);
            Sport pickleball = sportRepository.findByName("Pickleball").orElse(null);

            if (courtRepository.count() == 0 && ownerProfile != null) {
                // Court 1: Bóng đá
                if (bongDa != null) {
                    Court court1 = Court.builder()
                            .owner(ownerProfile)
                            .name("Cụm Sân Bóng Đá Sporta Cầu Giấy")
                            .price(150000.0)
                            .description("Sân bóng cỏ nhân tạo chất lượng cao, hệ thống chiếu sáng hiện đại, bãi xe rộng rãi, phục vụ nước uống miễn phí.")
                            .coverImage("https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop")
                            .openingTime("06:00")
                            .closingTime("23:00")
                            .location("15 Dịch Vọng Hậu, Cầu Giấy, Hà Nội")
                            .sport(bongDa)
                            .venue(venueCauGiay)
                            .status(CourtStatus.APPROVED)
                            .build();
                    court1 = courtRepository.save(court1);

                    courtImageRepository.save(CourtImage.builder().court(court1).imageUrl("https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=600&auto=format&fit=crop").build());
                    courtImageRepository.save(CourtImage.builder().court(court1).imageUrl("https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=600&auto=format&fit=crop").build());
                }

                // Court 2: Pickleball
                if (pickleball != null) {
                    Court court2 = Court.builder()
                            .owner(ownerProfile)
                            .name("Cụm Sân Pickleball Sporta Quận 7")
                            .price(250000.0)
                            .description("Tổ hợp sân Pickleball trong nhà đạt tiêu chuẩn thi đấu quốc tế. Thảm giảm chấn chất lượng cao, điều hòa mát mẻ.")
                            .coverImage("https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=600&auto=format&fit=crop")
                            .openingTime("05:00")
                            .closingTime("22:00")
                            .location("45 Nguyễn Văn Linh, Tân Phong, Quận 7, TP. Hồ Chí Minh")
                            .sport(pickleball)
                            .venue(venueQuan7)
                            .status(CourtStatus.APPROVED)
                            .build();
                    court2 = courtRepository.save(court2);

                    courtImageRepository.save(CourtImage.builder().court(court2).imageUrl("https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=600&auto=format&fit=crop").build());
                }

                // Court 3: Cầu lông (Pending)
                if (cauLong != null) {
                    Court court3 = Court.builder()
                            .owner(ownerProfile)
                            .name("Sân Cầu Lông Sporta Thanh Xuân")
                            .price(80000.0)
                            .description("Sân cầu lông thảm chuyên dụng mới hoàn thiện. Trực thuộc câu lạc bộ thể thao Thanh Xuân.")
                            .coverImage("https://images.unsplash.com/photo-1613918431201-f2f27ddc5ca7?q=80&w=600&auto=format&fit=crop")
                            .openingTime("06:00")
                            .closingTime("22:00")
                            .location("88 Khuất Duy Tiến, Thanh Xuân, Hà Nội")
                            .sport(cauLong)
                            .venue(venueCauGiay)
                            .status(CourtStatus.PENDING)
                            .build();
                    court3 = courtRepository.save(court3);

                    courtImageRepository.save(CourtImage.builder().court(court3).imageUrl("https://images.unsplash.com/photo-1521537634581-0dccd2ece234?q=80&w=600&auto=format&fit=crop").build());
                }

                // Court 4: Cầu lông (Rejected with reason)
                if (cauLong != null) {
                    Court court4 = Court.builder()
                            .owner(ownerProfile)
                            .name("Sân Cầu Lông Sporta Ba Đình")
                            .price(90000.0)
                            .description("Sân cầu lông thảm chuyên dụng nằm trong cụm sân Ba Đình.")
                            .coverImage("https://images.unsplash.com/photo-1613918431201-f2f27ddc5ca7?q=80&w=600&auto=format&fit=crop")
                            .openingTime("06:00")
                            .closingTime("22:00")
                            .location("34 Hoàng Hoa Thám, Ba Đình, Hà Nội")
                            .sport(cauLong)
                            .venue(venueBaDinh)
                            .status(CourtStatus.REJECTED)
                            .rejectionReason("Ảnh bìa mờ, địa chỉ không khớp thực tế. Vui lòng cập nhật lại hình ảnh rõ nét của sân.")
                            .build();
                    court4 = courtRepository.save(court4);

                    courtImageRepository.save(CourtImage.builder().court(court4).imageUrl("https://images.unsplash.com/photo-1521537634581-0dccd2ece234?q=80&w=600&auto=format&fit=crop").build());
                }
                System.out.println("Data Seeder: Đã thêm các sân bãi mẫu.");
            }
        }
    }
}
