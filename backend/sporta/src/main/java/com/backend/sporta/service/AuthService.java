package com.backend.sporta.service;

import com.backend.sporta.dto.*;
import com.backend.sporta.entity.*;
import com.backend.sporta.exception.CustomException;
import com.backend.sporta.repository.SportRepository;
import com.backend.sporta.repository.UserRepository;
import com.backend.sporta.repository.UserSportRepository;
import com.backend.sporta.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SportRepository sportRepository;

    @Autowired
    private UserSportRepository userSportRepository;

    @Autowired
    private OtpService otpService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException("Email hoặc mật khẩu không đúng", 401));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new CustomException("Email hoặc mật khẩu không đúng", 401);
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user.getEmail(), user.getId(), user.getRole().name());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .message("Đăng nhập thành công.")
                .build();
    }

    public void sendOtp(SendOtpRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CustomException("Email này đã được sử dụng. Vui lòng đăng nhập.", 400);
        }
        String otpCode = otpService.generateAndSaveOtp(request.getEmail());
        emailService.sendOtpEmail(request.getEmail(), otpCode);
    }

    public VerifyOtpResponse verifyOtp(VerifyOtpRequest request) {
        otpService.verifyOtp(request.getEmail(), request.getOtp());

        // Do chúng ta tách riêng Đăng nhập/Đăng ký, verifyOtp hiện tại chỉ dùng cho Đăng ký
        String registrationToken = jwtTokenProvider.generateRegistrationToken(request.getEmail());
        
        return VerifyOtpResponse.builder()
                .isNewUser(true)
                .registrationToken(registrationToken)
                .message("Mã xác thực chính xác. Vui lòng hoàn tất thông tin.")
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (!jwtTokenProvider.validateToken(request.getRegistrationToken())) {
            throw new CustomException("Registration token không hợp lệ hoặc đã hết hạn.", 400);
        }

        String email = jwtTokenProvider.getEmailFromToken(request.getRegistrationToken());

        if (userRepository.existsByEmail(email)) {
            throw new CustomException("Email này đã được sử dụng. Vui lòng đăng nhập.", 400);
        }

        // Tạo User
        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .gender(request.getGender())
                .dateOfBirth(request.getDateOfBirth())
                .role(Role.PLAYER) // Default role
                .status(UserStatus.ACTIVE)
                .build();

        user = userRepository.save(user);

        // Lưu thông tin môn thể thao
        for (SportProfileDto sportProfile : request.getSports()) {
            Sport sport = sportRepository.findById(sportProfile.getSportId())
                    .orElseThrow(() -> new CustomException("Môn thể thao không tồn tại: " + sportProfile.getSportId(), 404));

            UserSport userSport = UserSport.builder()
                    .user(user)
                    .sport(sport)
                    .level(sportProfile.getLevel())
                    .build();

            userSportRepository.save(userSport);
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user.getEmail(), user.getId(), user.getRole().name());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .message("Đăng ký thành công.")
                .build();
    }

    public void logout(String authorizationHeader) {
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7);
            if (jwtTokenProvider.validateToken(token)) {
                java.util.Date expiration = jwtTokenProvider.getExpirationFromToken(token);
                tokenBlacklistService.blacklistToken(token, expiration);
            }
        }
    }
}
