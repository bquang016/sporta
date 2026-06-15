package com.backend.sporta.config;

import com.backend.sporta.entity.Sport;
import com.backend.sporta.repository.SportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private SportRepository sportRepository;

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
    }
}
