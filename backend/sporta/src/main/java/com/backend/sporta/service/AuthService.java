package com.backend.sporta.service;

import com.backend.sporta.dto.*;
import com.backend.sporta.entity.*;
import com.backend.sporta.enums.Gender;
import com.backend.sporta.enums.RegistrationStatus;
import com.backend.sporta.enums.Role;
import com.backend.sporta.exception.CustomException;
import com.backend.sporta.repository.OwnerRepository;
import com.backend.sporta.repository.OwnerRegistrationRepository;
import com.backend.sporta.repository.SportRepository;
import com.backend.sporta.repository.UserRepository;
import com.backend.sporta.repository.LockLogRepository;
import com.backend.sporta.entity.LockLog;
import com.backend.sporta.repository.UserSportRepository;
import com.backend.sporta.repository.VenueRepository;
import com.backend.sporta.repository.CourtRepository;
import com.backend.sporta.repository.CourtPricingRepository;
import com.backend.sporta.repository.RolePermissionRepository;
import com.backend.sporta.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Optional;
import java.util.Collections;
import java.util.UUID;
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
    private OwnerRegistrationRepository ownerRegistrationRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private CourtRepository courtRepository;

    @Autowired
    private CourtPricingRepository courtPricingRepository;

    @Autowired
    private RolePermissionRepository rolePermissionRepository;

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

    @Autowired
    private LockLogRepository lockLogRepository;

    // ═══════════════════════════════════════════════════════════════════════════
    //  LOGIN
    // ═══════════════════════════════════════════════════════════════════════════

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException("Email hoặc mật khẩu không đúng", 401));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new CustomException("Email hoặc mật khẩu không đúng", 401);
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            if (user.getStatus() == UserStatus.BANNED) {
                LockLog latestLog = lockLogRepository.findFirstByUserIdAndActionOrderByCreatedAtDesc(user.getId(), "LOCK")
                        .orElse(null);
                String reason = latestLog != null
                        ? latestLog.getReasonCategory() + " - " + latestLog.getReasonDetail()
                        : "Không xác định";
                throw new CustomException("Tài khoản của bạn đã bị khóa. Lý do: " + reason + ". Vui lòng liên hệ hotline Sporta để được hỗ trợ.", 403);
            }
            throw new CustomException("Tài khoản của bạn không ở trạng thái hoạt động.", 403);
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user.getEmail(), user.getId(), user.getRole().name());

        java.util.List<String> permissions = java.util.Collections.emptyList();
        if (user.getRole() == Role.ADMIN) {
            java.util.List<RolePermission> adminPerms = rolePermissionRepository.findByRole(Role.ADMIN);
            if (adminPerms.isEmpty()) {
                RolePermission dashboard = RolePermission.builder().role(Role.ADMIN).feature("VIEW_DASHBOARD").isAllowed(true).build();
                RolePermission facilities = RolePermission.builder().role(Role.ADMIN).feature("MANAGE_FACILITIES").isAllowed(true).build();
                RolePermission owners = RolePermission.builder().role(Role.ADMIN).feature("MANAGE_OWNERS").isAllowed(true).build();
                RolePermission users = RolePermission.builder().role(Role.ADMIN).feature("MANAGE_USERS").isAllowed(true).build();
                RolePermission system = RolePermission.builder().role(Role.ADMIN).feature("MANAGE_SYSTEM").isAllowed(false).build();
                
                adminPerms = rolePermissionRepository.saveAll(java.util.List.of(dashboard, facilities, owners, users, system));
            }
            permissions = adminPerms.stream()
                    .filter(RolePermission::isAllowed)
                    .map(RolePermission::getFeature)
                    .collect(java.util.stream.Collectors.toList());
        } else if (user.getRole() == Role.SUPER_ADMIN) {
            permissions = java.util.List.of("ALL_FEATURES");
        }

        return AuthResponse.builder()
                .accessToken(accessToken)
                .message("Đăng nhập thành công.")
                .mustChangePassword(user.isMustChangePassword())
                .permissions(permissions)
                .build();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  SEND OTP
    // ═══════════════════════════════════════════════════════════════════════════

    public void sendOtp(SendOtpRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CustomException("Email này đã được sử dụng. Vui lòng đăng nhập.", 400);
        }
        // Check if a pending registration already exists for this email
        if (ownerRegistrationRepository.existsByEmailAndStatus(request.getEmail(), RegistrationStatus.PENDING)) {
            throw new CustomException("Đơn đăng ký của bạn đang chờ duyệt. Vui lòng đợi kết quả xét duyệt.", 400);
        }
        String otpCode = otpService.generateAndSaveOtp(request.getEmail());
        emailService.sendOtpEmail(request.getEmail(), otpCode);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  VERIFY OTP
    // ═══════════════════════════════════════════════════════════════════════════

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

    // ═══════════════════════════════════════════════════════════════════════════
    //  REGISTER (Player — kept for future use)
    // ═══════════════════════════════════════════════════════════════════════════

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

    // ═══════════════════════════════════════════════════════════════════════════
    //  REGISTER OWNER — Saves to staging table only (NO User/Owner created)
    // ═══════════════════════════════════════════════════════════════════════════

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
            String description,
            String courtsJson,
            org.springframework.web.multipart.MultipartFile idFrontImage,
            org.springframework.web.multipart.MultipartFile idBackImage,
            org.springframework.web.multipart.MultipartFile[] images) {

        // 1. Validate registration token
        if (!jwtTokenProvider.validateToken(registrationToken)) {
            throw new CustomException("Registration token không hợp lệ hoặc đã hết hạn.", 400);
        }

        String email = jwtTokenProvider.getEmailFromToken(registrationToken);

        // 2. Check if email already exists in users table
        if (userRepository.existsByEmail(email)) {
            throw new CustomException("Email này đã được sử dụng.", 400);
        }

        // 3. Check if a pending registration already exists
        if (ownerRegistrationRepository.existsByEmailAndStatus(email, RegistrationStatus.PENDING)) {
            throw new CustomException("Đơn đăng ký của bạn đang chờ duyệt.", 400);
        }

        // 4. Upload CCCD images
        String idFrontUrl = null;
        String idBackUrl = null;
        if (idFrontImage != null && !idFrontImage.isEmpty()) {
            idFrontUrl = fileStorageService.uploadFile(idFrontImage, "cccd");
        }
        if (idBackImage != null && !idBackImage.isEmpty()) {
            idBackUrl = fileStorageService.uploadFile(idBackImage, "cccd");
        }

        // 5. Upload venue images
        java.util.List<String> imageUrls = new java.util.ArrayList<>();
        if (images != null && images.length > 0) {
            for (org.springframework.web.multipart.MultipartFile file : images) {
                if (!file.isEmpty()) {
                    String url = fileStorageService.uploadFile(file, "owner_registration");
                    imageUrls.add(url);
                }
            }
        }

        // Convert URLs list to JSON string
        String imagesJson = "[]";
        try {
            ObjectMapper mapper = new ObjectMapper();
            imagesJson = mapper.writeValueAsString(imageUrls);
        } catch (Exception e) {
            throw new CustomException("Lỗi khi xử lý hình ảnh đăng ký.", 500);
        }

        // 6. Save to staging table (owner_registrations) — NOT creating User/Owner/Venue
        OwnerRegistration registration = OwnerRegistration.builder()
                .email(email)
                .fullName(fullName)
                .idNumber(idNumber)
                .idFrontImage(idFrontUrl)
                .idBackImage(idBackUrl)
                .venueName(venueName)
                .province(province)
                .district(district)
                .ward(ward)
                .sportTypes(sportTypes)
                .subCourtCount(subCourtCount)
                .description(description)
                .registrationImages(imagesJson)
                .courtsJson(courtsJson)
                .status(RegistrationStatus.PENDING)
                .build();

        ownerRegistrationRepository.save(registration);

        return RegisterOwnerResponse.builder()
                .message("Hồ sơ đã được gửi thành công. Chúng tôi sẽ xét duyệt và liên hệ với bạn qua email sớm nhất.")
                .build();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  APPROVE OWNER REGISTRATION — Admin approves, creates User/Owner/Venue/Court
    // ═══════════════════════════════════════════════════════════════════════════

    @Transactional
    public void approveOwnerRegistration(UUID registrationId) {
        OwnerRegistration reg = ownerRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new CustomException("Không tìm thấy đơn đăng ký.", 404));

        if (reg.getStatus() != RegistrationStatus.PENDING) {
            throw new CustomException("Đơn đăng ký đã được xử lý trước đó.", 400);
        }

        // Double-check email not taken
        if (userRepository.existsByEmail(reg.getEmail())) {
            throw new CustomException("Email này đã được sử dụng bởi tài khoản khác.", 400);
        }

        // 1. Generate random password
        String rawPassword = generateRandomPassword(8);

        // 2. Create User (role=OWNER, status=ACTIVE, mustChangePassword=true)
        User user = User.builder()
                .email(reg.getEmail())
                .password(passwordEncoder.encode(rawPassword))
                .fullName(reg.getFullName())
                .role(Role.OWNER)
                .status(UserStatus.ACTIVE)
                .mustChangePassword(true)
                .build();
        user = userRepository.save(user);

        // 3. Create Owner
        Owner owner = Owner.builder()
                .user(user)
                .fullName(reg.getFullName())
                .idNumber(reg.getIdNumber())
                .idFrontImage(reg.getIdFrontImage())
                .idBackImage(reg.getIdBackImage())
                .phoneNumber("") // will be updated later
                .build();
        owner = ownerRepository.save(owner);

        // 4. Create Venue
        Venue venue = Venue.builder()
                .owner(owner)
                .name(reg.getVenueName())
                .location(reg.getWard() + ", " + reg.getDistrict() + ", " + reg.getProvince())
                .province(reg.getProvince())
                .district(reg.getDistrict())
                .ward(reg.getWard())
                .sportTypes(reg.getSportTypes())
                .subCourtCount(reg.getSubCourtCount())
                .registrationImages(reg.getRegistrationImages())
                .description(reg.getDescription())
                .status(com.backend.sporta.enums.VenueStatus.PENDING_APPROVAL)
                .build();
        venue = venueRepository.save(venue);


        // 6. Create Courts and CourtPricing
        try {
            ObjectMapper mapper = new ObjectMapper();
            java.util.List<java.util.Map<String, Object>> courtsList = mapper.readValue(reg.getCourtsJson(),
                    mapper.getTypeFactory().constructCollectionType(java.util.List.class, java.util.Map.class));
            
            for (java.util.Map<String, Object> courtData : courtsList) {
                String courtName = (String) courtData.getOrDefault("name", "Sân " + (courtsList.indexOf(courtData) + 1));
                String courtSportType = (String) courtData.getOrDefault("sportType", "");

                // Find Sport entity
                Sport sport = sportRepository.findAll().stream()
                        .filter(s -> s.getName().equalsIgnoreCase(courtSportType))
                        .findFirst()
                        .orElse(sportRepository.findAll().isEmpty() ? null : sportRepository.findAll().get(0));

                if (sport == null) {
                    continue; // Skip if no sport found
                }

                Court court = Court.builder()
                        .venue(venue)
                        .name(courtName)
                        .price(0.0)
                        .status(com.backend.sporta.enums.CourtStatus.ACTIVE)
                        .build();
                court = courtRepository.save(court);

                // Create pricing slots
                @SuppressWarnings("unchecked")
                java.util.List<java.util.Map<String, Object>> pricingSlots = 
                        (java.util.List<java.util.Map<String, Object>>) courtData.getOrDefault("pricingSlots", java.util.Collections.emptyList());
                
                for (java.util.Map<String, Object> slot : pricingSlots) {
                    CourtPricing pricing = CourtPricing.builder()
                            .court(court)
                            .slotLabel((String) slot.getOrDefault("label", ""))
                            .startTime((String) slot.getOrDefault("startTime", ""))
                            .endTime((String) slot.getOrDefault("endTime", ""))
                            .price(((Number) slot.getOrDefault("price", 0)).doubleValue())
                            .build();
                    courtPricingRepository.save(pricing);
                }
            }
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            // Ignore if courts JSON is invalid — not critical
        }

        // 7. Update registration status
        reg.setStatus(RegistrationStatus.APPROVED);
        ownerRegistrationRepository.save(reg);

        // 8. Send email with account credentials
        emailService.sendAccountApprovedEmail(reg.getEmail(), rawPassword);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  REJECT OWNER REGISTRATION
    // ═══════════════════════════════════════════════════════════════════════════

    @Transactional
    public void rejectOwnerRegistration(UUID registrationId, String reason) {
        OwnerRegistration reg = ownerRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new CustomException("Không tìm thấy đơn đăng ký.", 404));

        if (reg.getStatus() != RegistrationStatus.PENDING) {
            throw new CustomException("Đơn đăng ký đã được xử lý trước đó.", 400);
        }

        reg.setStatus(RegistrationStatus.REJECTED);
        reg.setRejectionReason(reason != null ? reason : "");
        ownerRegistrationRepository.save(reg);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  CHANGE PASSWORD (First login or voluntary)
    // ═══════════════════════════════════════════════════════════════════════════

    @Transactional
    public void changePassword(String authorizationHeader, ChangePasswordRequest request) {
        // Validate confirm password matches
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new CustomException("Mật khẩu xác nhận không khớp.", 400);
        }

        // Extract user from JWT
        String token = extractToken(authorizationHeader);
        if (token == null || !jwtTokenProvider.validateToken(token)) {
            throw new CustomException("Token không hợp lệ.", 401);
        }

        String email = jwtTokenProvider.getEmailFromToken(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("Không tìm thấy tài khoản.", 404));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new CustomException("Mật khẩu hiện tại không chính xác.", 400);
        }

        // Ensure new password is different from current
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new CustomException("Mật khẩu mới phải khác mật khẩu hiện tại.", 400);
        }

        // Update password and clear the mustChangePassword flag
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        userRepository.save(user);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  GOOGLE LOGIN
    // ═══════════════════════════════════════════════════════════════════════════

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
                    if (user.getStatus() == UserStatus.BANNED) {
                        LockLog latestLog = lockLogRepository.findFirstByUserIdAndActionOrderByCreatedAtDesc(user.getId(), "LOCK")
                                .orElse(null);
                        String reason = latestLog != null
                                ? latestLog.getReasonCategory() + " - " + latestLog.getReasonDetail()
                                : "Không xác định";
                        throw new CustomException("Tài khoản của bạn đã bị khóa. Lý do: " + reason + ". Vui lòng liên hệ hotline Sporta để được hỗ trợ.", 403);
                    }
                    throw new CustomException("Tài khoản của bạn không ở trạng thái hoạt động.", 403);
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

    // ═══════════════════════════════════════════════════════════════════════════
    //  LOGOUT
    // ═══════════════════════════════════════════════════════════════════════════

    public void logout(String authorizationHeader) {
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7);
            if (jwtTokenProvider.validateToken(token)) {
                java.util.Date expiration = jwtTokenProvider.getExpirationFromToken(token);
                tokenBlacklistService.blacklistToken(token, expiration);
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  PRIVATE HELPERS
    // ═══════════════════════════════════════════════════════════════════════════

    private String extractToken(String authorizationHeader) {
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7);
        }
        return null;
    }

    /**
     * Generate a random password with uppercase, lowercase, and digits.
     */
    private String generateRandomPassword(int length) {
        String upperChars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        String lowerChars = "abcdefghjkmnpqrstuvwxyz";
        String digits = "23456789";
        String allChars = upperChars + lowerChars + digits;

        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(length);

        // Ensure at least one of each type
        sb.append(upperChars.charAt(random.nextInt(upperChars.length())));
        sb.append(lowerChars.charAt(random.nextInt(lowerChars.length())));
        sb.append(digits.charAt(random.nextInt(digits.length())));

        // Fill the rest
        for (int i = 3; i < length; i++) {
            sb.append(allChars.charAt(random.nextInt(allChars.length())));
        }

        // Shuffle the result
        char[] passwordArray = sb.toString().toCharArray();
        for (int i = passwordArray.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            char temp = passwordArray[i];
            passwordArray[i] = passwordArray[j];
            passwordArray[j] = temp;
        }

        return new String(passwordArray);
    }
}
