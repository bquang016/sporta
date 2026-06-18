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
import com.backend.sporta.repository.UserRepository;
import com.backend.sporta.repository.OwnerRepository;
import com.backend.sporta.repository.CourtRepository;
import com.backend.sporta.repository.CourtImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

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
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
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
                            .status(CourtStatus.APPROVED)
                            .build();
                    court2 = courtRepository.save(court2);

                    courtImageRepository.save(CourtImage.builder().court(court2).imageUrl("https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=600&auto=format&fit=crop").build());
                }

                // Court 3: Cầu lông
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
                            .status(CourtStatus.PENDING)
                            .build();
                    court3 = courtRepository.save(court3);

                    courtImageRepository.save(CourtImage.builder().court(court3).imageUrl("https://images.unsplash.com/photo-1521537634581-0dccd2ece234?q=80&w=600&auto=format&fit=crop").build());
                }
                System.out.println("Data Seeder: Đã thêm các sân bãi mẫu.");
            }
        }
    }
}
