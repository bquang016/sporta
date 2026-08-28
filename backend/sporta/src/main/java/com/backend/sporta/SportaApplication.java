package com.backend.sporta;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class SportaApplication {

	public static void main(String[] args) {
		SpringApplication.run(SportaApplication.class, args);
	}

}
