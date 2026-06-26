package com.backend.sporta.config;

import com.backend.sporta.entity.Sport;
import com.backend.sporta.entity.User;
import com.backend.sporta.enums.Role;
import com.backend.sporta.entity.UserStatus;
import com.backend.sporta.entity.Owner;
import com.backend.sporta.entity.Court;
import com.backend.sporta.entity.VenueImage;
import com.backend.sporta.enums.CourtStatus;
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

import java.time.LocalDate;
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
                        .location("15 Dịch Vọng Hậu, Cầu Giấy, Hà Nội")
                        .description("Tổ hợp thể thao Cầu Giấy với 4 sân bóng đá mini và 6 sân cầu lông.")
                        .openingTime("06:00")
                        .closingTime("23:00")
                        .sport(bongDa)
                        .coverImage("https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop")
                        .build();
                venueCauGiay = venueRepository.save(venueCauGiay);

                venueImageRepository.save(VenueImage.builder().venue(venueCauGiay).imageUrl("https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=600&auto=format&fit=crop").build());
                venueImageRepository.save(VenueImage.builder().venue(venueCauGiay).imageUrl("https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=600&auto=format&fit=crop").build());

                venueQuan7 = Venue.builder()
                        .owner(ownerProfile)
                        .name("Cụm sân Quận 7")
                        .location("45 Nguyễn Văn Linh, Tân Phong, Quận 7, TP. Hồ Chí Minh")
                        .description("Cụm sân Pickleball trong nhà hiện đại và cao cấp nhất khu vực Nam Sài Gòn.")
                        .openingTime("05:00")
                        .closingTime("22:00")
                        .sport(pickleball)
                        .coverImage("https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=600&auto=format&fit=crop")
                        .build();
                venueQuan7 = venueRepository.save(venueQuan7);

                venueImageRepository.save(VenueImage.builder().venue(venueQuan7).imageUrl("https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=600&auto=format&fit=crop").build());

                venueBaDinh = Venue.builder()
                        .owner(ownerProfile)
                        .name("Cụm sân Ba Đình")
                        .location("34 Hoàng Hoa Thám, Ba Đình, Hà Nội")
                        .description("Khu phức hợp thể thao ngoài trời Ba Đình.")
                        .openingTime("06:00")
                        .closingTime("22:00")
                        .sport(cauLong)
                        .coverImage("https://images.unsplash.com/photo-1613918431201-f2f27ddc5ca7?q=80&w=600&auto=format&fit=crop")
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
}
