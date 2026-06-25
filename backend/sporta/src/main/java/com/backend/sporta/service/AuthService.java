package com.backend.sporta.service;

import com.backend.sporta.dto.*;
import com.backend.sporta.entity.*;
import com.backend.sporta.enums.Gender;
import com.backend.sporta.enums.Role;
import com.backend.sporta.exception.CustomException;
import com.backend.sporta.repository.OwnerRepository;
import com.backend.sporta.repository.SportRepository;
import com.backend.sporta.repository.UserRepository;
import com.backend.sporta.repository.UserSportRepository;
import com.backend.sporta.repository.VenueRepository;
import com.backend.sporta.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Collections;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;

@Service
public class AuthService {

    @Value("${google.client.id}")
    private String googleClientId;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SportRepository sportRepository;

    @Autowired
    private UserSportRepository userSportRepository;

    @Autowired
    private OtpService otpService;

    @Autowired
    private OwnerRepository ownerRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private FileStorageService fileStorageService;

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

    @Transactional
    public RegisterOwnerResponse registerOwner(
            String registrationToken,
            String fullName,
            String idNumber,
            String venueName,
            String province,
            String district,
            String ward,
            String sportTypes,
            int subCourtCount,
            org.springframework.web.multipart.MultipartFile[] images) {

        // 1. Validate registration token
        if (!jwtTokenProvider.validateToken(registrationToken)) {
            throw new CustomException("Registration token không hợp lệ hoặc đã hết hạn.", 400);
        }

        String email = jwtTokenProvider.getEmailFromToken(registrationToken);

        // 2. Check if email already exists
        if (userRepository.existsByEmail(email)) {
            throw new CustomException("Email này đã được sử dụng.", 400);
        }

        // 3. Create User (role=OWNER, status=PENDING_APPROVAL)
        User user = User.builder()
                .email(email)
                // Use a random password for pending owners. They will reset it upon approval.
                .password(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                .fullName(fullName)
                .role(Role.OWNER)
                .status(UserStatus.PENDING_APPROVAL)
                .build();
        user = userRepository.save(user);

        // 4. Create Owner
        Owner owner = Owner.builder()
                .user(user)
                .fullName(fullName)
                .idNumber(idNumber)
                .phoneNumber("") // will be updated later
                .build();
        owner = ownerRepository.save(owner);

        // 5. Upload images
        java.util.List<String> imageUrls = new java.util.ArrayList<>();
        if (images != null && images.length > 0) {
            for (org.springframework.web.multipart.MultipartFile file : images) {
                if (!file.isEmpty()) {
                    String url = fileStorageService.uploadFile(file, "owner_registration");
                    imageUrls.add(url);
                }
            }
        }
        
        // Convert URLs list to JSON string for saving
        String imagesJson = "[]";
        try {
            ObjectMapper mapper = new ObjectMapper();
            imagesJson = mapper.writeValueAsString(imageUrls);
        } catch (Exception e) {
            throw new CustomException("Lỗi khi xử lý hình ảnh đăng ký.", 500);
        }

        // 6. Create Venue (status=PENDING_APPROVAL)
        Venue venue = Venue.builder()
                .owner(owner)
                .name(venueName)
                // Use full address as location temporarily
                .location(ward + ", " + district + ", " + province)
                .province(province)
                .district(district)
                .ward(ward)
                .sportTypes(sportTypes)
                .subCourtCount(subCourtCount)
                .registrationImages(imagesJson)
                .status(com.backend.sporta.enums.VenueStatus.PENDING_APPROVAL)
                .build();
        venueRepository.save(venue);

        return RegisterOwnerResponse.builder()
                .message("Hồ sơ đã được gửi thành công. Chúng tôi sẽ liên hệ với bạn sớm nhất.")
                .build();
    }

    public GoogleLoginResponse googleLogin(GoogleLoginRequest request) {
        try {
            NetHttpTransport transport = new NetHttpTransport();
            GsonFactory jsonFactory = GsonFactory.getDefaultInstance();

            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(transport, jsonFactory)
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(request.getIdToken());
            if (idToken == null) {
                throw new CustomException("Xác thực Google thất bại.", 400);
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String fullName = (String) payload.get("name");

            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                if (user.getStatus() != UserStatus.ACTIVE) {
                    throw new CustomException("Tài khoản của bạn đã bị khóa.", 403);
                }
                String accessToken = jwtTokenProvider.generateAccessToken(user.getEmail(), user.getId(), user.getRole().name());
                return GoogleLoginResponse.builder()
                        .isNewUser(false)
                        .accessToken(accessToken)
                        .email(email)
                        .fullName(user.getFullName())
                        .message("Đăng nhập Google thành công.")
                        .build();
            } else {
                String registrationToken = jwtTokenProvider.generateRegistrationToken(email);
                return GoogleLoginResponse.builder()
                        .isNewUser(true)
                        .registrationToken(registrationToken)
                        .email(email)
                        .fullName(fullName)
                        .message("Tài khoản chưa tồn tại. Vui lòng hoàn tất thông tin.")
                        .build();
            }
        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            throw new CustomException("Có lỗi xảy ra khi xác thực Google: " + e.getMessage(), 500);
        }
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
