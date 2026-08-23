package com.backend.sporta.service;

import com.backend.sporta.dto.*;
import com.backend.sporta.entity.*;
import com.backend.sporta.enums.Gender;
import com.backend.sporta.enums.RegistrationStatus;
import com.backend.sporta.enums.Role;
import com.backend.sporta.enums.UserStatus;
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
    private com.backend.sporta.repository.CourtPriceRuleRepository courtPriceRuleRepository;

    @Autowired
    private com.backend.sporta.repository.OwnerContractRepository ownerContractRepository;

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

        if (user.getIsDeleted()) {
            throw new CustomException("Tài khoản của bạn đã bị ngừng hoạt động hoặc xóa.", 403);
        }

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

    public String sendOtp(SendOtpRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CustomException("Email này đã được sử dụng. Vui lòng đăng nhập.", 400);
        }
        // Check if a pending registration already exists for this email
        if (ownerRegistrationRepository.existsByEmailAndStatus(request.getEmail(), RegistrationStatus.PENDING)) {
            throw new CustomException("Đơn đăng ký của bạn đang chờ duyệt. Vui lòng đợi kết quả xét duyệt.", 400);
        }
        String otpCode = otpService.generateAndSaveOtp(request.getEmail());
        try {
            emailService.sendOtpEmail(request.getEmail(), otpCode);
        } catch(Exception e) {
            System.err.println("Email send failed: " + e.getMessage());
        }
        return otpCode;
    }

    public String sendOtpForContract(SendOtpRequest request) {
        // Do not check if email exists because the user is already logged in
        String otpCode = otpService.generateAndSaveOtp(request.getEmail());
        try {
            emailService.sendOtpEmail(request.getEmail(), otpCode);
        } catch(Exception e) {
            System.err.println("Email send failed: " + e.getMessage());
        }
        return otpCode;
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
            String addressDetail,
            Long sportId,
            java.time.LocalTime openingTime,
            java.time.LocalTime closingTime,
            Integer shiftDurationMinutes,
            Boolean hasSurcharge,
            Double surchargeAmount,
            String surchargeDescription,
            Double latitude,
            Double longitude,
            int subCourtCount,
            String description,
            String courtsJson,
            Integer freeCancellationHours,
            Integer lateCancellationRefundRate,
            Boolean rainRescheduleAllowed,
            org.springframework.web.multipart.MultipartFile idFrontImage,
            org.springframework.web.multipart.MultipartFile idBackImage,
            String coverImage,
            String registrationImages,
            Boolean isContractSigned,
            String signatureTimestamp,
            String signatureIp) {

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
                .addressDetail(addressDetail)
                .sportId(sportId)
                .openingTime(openingTime)
                .closingTime(closingTime)
                .shiftDurationMinutes(shiftDurationMinutes)
                .hasSurcharge(hasSurcharge)
                .surchargeAmount(surchargeAmount)
                .surchargeDescription(surchargeDescription)
                .latitude(latitude)
                .longitude(longitude)
                .subCourtCount(subCourtCount)
                .description(description)
                .coverImage(coverImage)
                .registrationImages(registrationImages)
                .courtsJson(courtsJson)
                .freeCancellationHours(freeCancellationHours)
                .lateCancellationRefundRate(lateCancellationRefundRate)
                .rainRescheduleAllowed(rainRescheduleAllowed)
                .isContractSigned(isContractSigned != null ? isContractSigned : false)
                .signatureIp(signatureIp)
                .signatureTimestamp(signatureTimestamp != null ? java.time.LocalDateTime.parse(signatureTimestamp.replace("Z", "")) : null)
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
    public String approveOwnerRegistration(UUID registrationId) {
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

        // Parse registrationImages to set VenueImage list
        String coverImage = reg.getCoverImage();
        java.util.List<VenueImage> venueImagesList = new java.util.ArrayList<>();
        if (reg.getRegistrationImages() != null && !reg.getRegistrationImages().trim().isEmpty()) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                java.util.List<String> imageUrls = mapper.readValue(reg.getRegistrationImages(),
                        mapper.getTypeFactory().constructCollectionType(java.util.List.class, String.class));
                if (!imageUrls.isEmpty()) {
                    // Add all to VenueImage
                    for (String url : imageUrls) {
                        venueImagesList.add(VenueImage.builder().imageUrl(url).build());
                    }
                }
            } catch (Exception e) {
                System.err.println("Failed to parse registrationImages: " + e.getMessage());
            }
        }

        Sport sport = null;
        if (reg.getSportId() != null) {
            sport = sportRepository.findById(reg.getSportId()).orElse(null);
        }

        // 4. Create Venue
        Venue venue = Venue.builder()
                .owner(owner)
                .name(reg.getVenueName())
                .location((reg.getAddressDetail() != null && !reg.getAddressDetail().isEmpty() ? reg.getAddressDetail() + ", " : "") + reg.getWard() + ", " + reg.getDistrict() + ", " + reg.getProvince())
                .province(reg.getProvince())
                .district(reg.getDistrict())
                .ward(reg.getWard())
                .addressDetail(reg.getAddressDetail())
                .sport(sport)
                .subCourtCount(reg.getSubCourtCount())
                .registrationImages(reg.getRegistrationImages())
                .coverImage(coverImage)
                .description(reg.getDescription())
                .status(com.backend.sporta.enums.VenueStatus.ACTIVE)
                .approvalStatus(com.backend.sporta.enums.ApprovalStatus.APPROVED)
                .latitude(reg.getLatitude() != null ? reg.getLatitude() : 10.762622)
                .longitude(reg.getLongitude() != null ? reg.getLongitude() : 106.660172)
                .openingTime(reg.getOpeningTime() != null ? reg.getOpeningTime() : java.time.LocalTime.of(5, 0))
                .closingTime(reg.getClosingTime() != null ? reg.getClosingTime() : java.time.LocalTime.of(22, 0))
                .shiftDurationMinutes(reg.getShiftDurationMinutes() != null ? reg.getShiftDurationMinutes() : 60)
                .hasSurcharge(reg.getHasSurcharge() != null ? reg.getHasSurcharge() : false)
                .surchargeAmount(reg.getSurchargeAmount())
                .surchargeDescription(reg.getSurchargeDescription())
                .build();
        
        // Associate venue images with venue
        for (VenueImage vi : venueImagesList) {
            vi.setVenue(venue);
        }
        venue.setImages(venueImagesList);

        VenuePolicy venuePolicy = VenuePolicy.builder()
                .venue(venue)
                .freeCancellationHours(reg.getFreeCancellationHours() != null ? reg.getFreeCancellationHours() : 12)
                .lateCancellationRefundRate(reg.getLateCancellationRefundRate() != null ? reg.getLateCancellationRefundRate() : 70)
                .rainRescheduleAllowed(reg.getRainRescheduleAllowed() != null ? reg.getRainRescheduleAllowed() : true)
                .build();
        venue.setVenuePolicy(venuePolicy);

        venue = venueRepository.save(venue);


        // 6. Create Courts and CourtPriceRules
        if (reg.getCourtsJson() != null && !reg.getCourtsJson().trim().isEmpty()) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                java.util.List<java.util.Map<String, Object>> courtsList = mapper.readValue(reg.getCourtsJson(),
                        mapper.getTypeFactory().constructCollectionType(java.util.List.class, java.util.Map.class));
                
                for (java.util.Map<String, Object> courtData : courtsList) {
                    String courtName = (String) courtData.getOrDefault("name", "Sân " + (courtsList.indexOf(courtData) + 1));
                    Double courtPrice = courtData.get("price") != null ? ((Number) courtData.get("price")).doubleValue() : 0.0;

                    Court court = Court.builder()
                            .venue(venue)
                            .name(courtName)
                            .price(courtPrice)
                            .status(com.backend.sporta.enums.CourtStatus.ACTIVE)
                            .build();
                    court = courtRepository.save(court);

                    // Create CourtPriceRule entries from priceRules array
                    @SuppressWarnings("unchecked")
                    java.util.List<java.util.Map<String, Object>> priceRules = 
                            (java.util.List<java.util.Map<String, Object>>) courtData.getOrDefault("priceRules", java.util.Collections.emptyList());
                    
                    if (priceRules != null && !priceRules.isEmpty()) {
                        for (java.util.Map<String, Object> ruleData : priceRules) {
                            String ruleTypeStr = (String) ruleData.getOrDefault("ruleType", "SHIFT");
                            com.backend.sporta.enums.PriceRuleType ruleType = com.backend.sporta.enums.PriceRuleType.valueOf(ruleTypeStr);

                            java.time.LocalTime startTime = null;
                            java.time.LocalTime endTime = null;
                            if (ruleData.get("startTime") != null) {
                                startTime = java.time.LocalTime.parse((String) ruleData.get("startTime"));
                            }
                            if (ruleData.get("endTime") != null) {
                                endTime = java.time.LocalTime.parse((String) ruleData.get("endTime"));
                            }

                            Double customPrice = ruleData.get("customPrice") != null ? ((Number) ruleData.get("customPrice")).doubleValue() : null;
                            Integer dayOfWeek = ruleData.get("dayOfWeek") != null ? ((Number) ruleData.get("dayOfWeek")).intValue() : null;
                            Double percentageModifier = ruleData.get("percentageModifier") != null ? ((Number) ruleData.get("percentageModifier")).doubleValue() : null;
                            Double fixedModifier = ruleData.get("fixedModifier") != null ? ((Number) ruleData.get("fixedModifier")).doubleValue() : null;

                            com.backend.sporta.entity.CourtPriceRule priceRule = com.backend.sporta.entity.CourtPriceRule.builder()
                                    .court(court)
                                    .ruleType(ruleType)
                                    .startTime(startTime)
                                    .endTime(endTime)
                                    .customPrice(customPrice)
                                    .dayOfWeek(dayOfWeek)
                                    .percentageModifier(percentageModifier)
                                    .fixedModifier(fixedModifier)
                                    .build();
                            courtPriceRuleRepository.save(priceRule);
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("Failed to parse courtsJson: " + e.getMessage());
                e.printStackTrace();
            }
        }

        // Update price range and sub_court_count
        Double minPrice = courtRepository.findMinPriceByVenueIdAndStatusActive(venue.getId());
        Double maxPrice = courtRepository.findMaxPriceByVenueIdAndStatusActive(venue.getId());
        int courtCount = courtRepository.findByVenueId(venue.getId()).size();
        venue.setMinPrice(minPrice != null ? minPrice : 0.0);
        venue.setMaxPrice(maxPrice != null ? maxPrice : 0.0);
        venue.setSubCourtCount(courtCount);
        venueRepository.save(venue);

        // 6.5 Create OwnerContract
        if (reg.getIsContractSigned() != null && reg.getIsContractSigned()) {
            String contractCode = "SPOR-CTR-" + java.time.Year.now().getValue() + "-" + venue.getId().toString().substring(0, 8).toUpperCase();
            
            com.backend.sporta.entity.OwnerContract contract = com.backend.sporta.entity.OwnerContract.builder()
                    .owner(owner)
                    .venue(venue)
                    .contractCode(contractCode)
                    .signedIpAddress(reg.getSignatureIp() != null ? reg.getSignatureIp() : "Unknown")
                    .signedAt(reg.getSignatureTimestamp() != null ? reg.getSignatureTimestamp() : java.time.LocalDateTime.now())
                    .status(com.backend.sporta.enums.ContractStatus.ACTIVE)
                    .build();
            
            // Generate simple hash (mock)
            try {
                String rawData = contractCode + venue.getId() + contract.getSignedAt().toString();
                java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
                byte[] hash = digest.digest(rawData.getBytes(java.nio.charset.StandardCharsets.UTF_8));
                StringBuilder hexString = new StringBuilder(2 * hash.length);
                for (byte b : hash) {
                    String hex = Integer.toHexString(0xff & b);
                    if (hex.length() == 1) {
                        hexString.append('0');
                    }
                    hexString.append(hex);
                }
                contract.setDigitalSignatureHash(hexString.toString());
            } catch (Exception e) {
                contract.setDigitalSignatureHash("HASH_ERROR");
            }

            ownerContractRepository.save(contract);
        }

        // 7. Update registration status
        reg.setStatus(RegistrationStatus.APPROVED);
        ownerRegistrationRepository.save(reg);

        // 8. Send email with account credentials
        try {
            emailService.sendAccountApprovedEmail(reg.getEmail(), rawPassword);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
        
        return rawPassword;
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
