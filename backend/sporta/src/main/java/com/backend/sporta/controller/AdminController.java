package com.backend.sporta.controller;

import com.backend.sporta.dto.UpdatePermissionRequest;
import com.backend.sporta.dto.CreateAdminRequest;
import com.backend.sporta.entity.RolePermission;
import com.backend.sporta.entity.User;
import com.backend.sporta.enums.UserStatus;
import com.backend.sporta.entity.LockReason;
import com.backend.sporta.entity.LockLog;
import com.backend.sporta.enums.Role;
import com.backend.sporta.repository.RolePermissionRepository;
import com.backend.sporta.repository.UserRepository;
import com.backend.sporta.repository.LockReasonRepository;
import com.backend.sporta.repository.LockLogRepository;
import com.backend.sporta.repository.OwnerRegistrationRepository;
import com.backend.sporta.entity.OwnerRegistration;
import com.backend.sporta.exception.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private RolePermissionRepository rolePermissionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LockReasonRepository lockReasonRepository;

    @Autowired
    private LockLogRepository lockLogRepository;

    @Autowired
    private OwnerRegistrationRepository ownerRegistrationRepository;

    @Autowired
    private com.backend.sporta.service.AuthService authService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/permissions")
    public ResponseEntity<List<RolePermission>> getAdminPermissions() {
        List<RolePermission> permissions = rolePermissionRepository.findByRole(Role.ADMIN);
        
        // Khởi tạo các quyền mặc định nếu chưa có
        if (permissions.isEmpty()) {
            RolePermission dashboard = RolePermission.builder().role(Role.ADMIN).feature("VIEW_DASHBOARD").isAllowed(true).build();
            RolePermission facilities = RolePermission.builder().role(Role.ADMIN).feature("MANAGE_FACILITIES").isAllowed(true).build();
            RolePermission owners = RolePermission.builder().role(Role.ADMIN).feature("MANAGE_OWNERS").isAllowed(true).build();
            RolePermission users = RolePermission.builder().role(Role.ADMIN).feature("MANAGE_USERS").isAllowed(true).build();
            RolePermission tickets = RolePermission.builder().role(Role.ADMIN).feature("MANAGE_TICKETS").isAllowed(true).build();
            RolePermission system = RolePermission.builder().role(Role.ADMIN).feature("MANAGE_SYSTEM").isAllowed(false).build();
            
            permissions = rolePermissionRepository.saveAll(List.of(dashboard, facilities, owners, users, tickets, system));
        } else {
            // Check missing permissions for older databases
            boolean hasSystem = permissions.stream().anyMatch(p -> p.getFeature().equals("MANAGE_SYSTEM"));
            boolean hasOwners = permissions.stream().anyMatch(p -> p.getFeature().equals("MANAGE_OWNERS"));
            boolean hasTickets = permissions.stream().anyMatch(p -> p.getFeature().equals("MANAGE_TICKETS"));
            
            if (!hasSystem || !hasOwners || !hasTickets) {
                if (!hasSystem) {
                    rolePermissionRepository.save(RolePermission.builder().role(Role.ADMIN).feature("MANAGE_SYSTEM").isAllowed(false).build());
                }
                if (!hasOwners) {
                    rolePermissionRepository.save(RolePermission.builder().role(Role.ADMIN).feature("MANAGE_OWNERS").isAllowed(true).build());
                }
                if (!hasTickets) {
                    rolePermissionRepository.save(RolePermission.builder().role(Role.ADMIN).feature("MANAGE_TICKETS").isAllowed(true).build());
                }
                // Fetch again to ensure list mutability is safe
                permissions = rolePermissionRepository.findByRole(Role.ADMIN);
            }
        }
        
        return ResponseEntity.ok(permissions);
    }

    @PutMapping("/permissions")
    public ResponseEntity<?> updateAdminPermissions(@RequestBody List<UpdatePermissionRequest> updates) {
        List<RolePermission> permissions = rolePermissionRepository.findByRole(Role.ADMIN);
        
        Map<String, RolePermission> permMap = permissions.stream()
                .collect(Collectors.toMap(RolePermission::getFeature, p -> p));
                
        for (UpdatePermissionRequest update : updates) {
            RolePermission perm = permMap.get(update.getFeature());
            if (perm != null) {
                perm.setAllowed(update.isAllowed());
            } else {
                // Thêm mới nếu chưa có
                perm = RolePermission.builder()
                        .role(Role.ADMIN)
                        .feature(update.getFeature())
                        .isAllowed(update.isAllowed())
                        .build();
                permMap.put(update.getFeature(), perm);
            }
        }
        
        rolePermissionRepository.saveAll(permMap.values());
        
        return ResponseEntity.ok(Map.of("message", "Cập nhật quyền thành công."));
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsers(
            @RequestParam(value = "role", required = false) String roleStr,
            @RequestParam(value = "search", required = false) String search) {
        
        List<User> users;
        if (roleStr != null && !roleStr.trim().isEmpty()) {
            Role role;
            try {
                role = Role.valueOf(roleStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new CustomException("Role không hợp lệ: " + roleStr, 400);
            }
            users = userRepository.findByRoleAndSearch(role, search);
        } else {
            if (search != null && !search.trim().isEmpty()) {
                users = userRepository.findBySearch(search);
            } else {
                users = userRepository.findAllActiveOrderByCreatedAtDesc();
            }
        }
        return ResponseEntity.ok(users);
    }

    @PostMapping("/users/create-admin")
    public ResponseEntity<?> createAdmin(@RequestBody CreateAdminRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User superAdmin = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin Super Admin", 404));
        
        if (superAdmin.getRole() != Role.SUPER_ADMIN) {
            throw new CustomException("Bạn không có quyền thực hiện thao tác này. Chỉ Super Admin mới có quyền tạo Admin.", 403);
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CustomException("Email này đã được đăng ký trong hệ thống.", 400);
        }
        
        User admin = User.builder()
                .fullName(request.getFullName().trim())
                .email(request.getEmail().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .mustChangePassword(false)
                .isDeleted(false)
                .build();
                
        userRepository.save(admin);
        return ResponseEntity.ok(Map.of("message", "Tạo tài khoản vận hành Admin thành công."));
    }

    @PostMapping("/users/{id}/deactivate")
    public ResponseEntity<?> deactivateAdmin(@PathVariable("id") Long userId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User superAdmin = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin Super Admin", 404));
        
        if (superAdmin.getRole() != Role.SUPER_ADMIN) {
            throw new CustomException("Bạn không có quyền thực hiện thao tác này. Chỉ Super Admin mới có quyền vô hiệu hóa Admin.", 403);
        }
        
        User adminToDeactivate = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin Admin cần vô hiệu hóa", 404));
        
        if (superAdmin.getId().equals(adminToDeactivate.getId())) {
            throw new CustomException("Bạn không thể tự vô hiệu hóa tài khoản của chính mình.", 400);
        }
        
        if (adminToDeactivate.getRole() != Role.ADMIN) {
            throw new CustomException("Chỉ có thể vô hiệu hóa tài khoản nhân sự có vai trò ADMIN.", 400);
        }
        
        adminToDeactivate.setIsDeleted(true);
        adminToDeactivate.setStatus(UserStatus.INACTIVE);
        userRepository.save(adminToDeactivate);
        
        return ResponseEntity.ok(Map.of("message", "Đã vô hiệu hóa tài khoản Admin thành công."));
    }

    @PostMapping("/users/{id}/lock")
    public ResponseEntity<?> lockUser(
            @PathVariable("id") Long userId,
            @RequestBody Map<String, String> body) {
        
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin admin", 404));
        
        User userToLock = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));
        
        if (admin.getId().equals(userToLock.getId())) {
            throw new CustomException("Bạn không thể tự khóa tài khoản của chính mình.", 400);
        }
        
        String reasonCategory = body.get("reasonCategory");
        String reasonDetail = body.get("reasonDetail");
        
        if (reasonCategory == null || reasonCategory.trim().isEmpty()) {
            throw new CustomException("Vui lòng chọn hoặc nhập lý do khóa.", 400);
        }
        
        if (reasonDetail == null || reasonDetail.trim().isEmpty()) {
            throw new CustomException("Vui lòng nhập chi tiết hành vi vi phạm.", 400);
        }
        
        userToLock.setStatus(UserStatus.BANNED);
        userRepository.save(userToLock);
        
        LockLog lockLog = LockLog.builder()
                .userId(userToLock.getId())
                .adminId(admin.getId())
                .action("LOCK")
                .reasonCategory(reasonCategory.trim())
                .reasonDetail(reasonDetail.trim())
                .build();
        lockLogRepository.save(lockLog);
        
        return ResponseEntity.ok(Map.of("message", "Đã khóa tài khoản thành công."));
    }

    @PostMapping("/users/{id}/unlock")
    public ResponseEntity<?> unlockUser(@PathVariable("id") Long userId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin admin", 404));
        
        User userToUnlock = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));
        
        userToUnlock.setStatus(UserStatus.ACTIVE);
        userRepository.save(userToUnlock);
        
        LockLog lockLog = LockLog.builder()
                .userId(userToUnlock.getId())
                .adminId(admin.getId())
                .action("UNLOCK")
                .reasonCategory("Mở khóa tài khoản")
                .reasonDetail("Admin kích hoạt lại tài khoản")
                .build();
        lockLogRepository.save(lockLog);
        
        return ResponseEntity.ok(Map.of("message", "Đã mở khóa tài khoản thành công."));
    }

    @PutMapping("/users/{id}/dev-tester")
    public ResponseEntity<?> toggleDevTester(
            @PathVariable("id") Long userId,
            @RequestBody(required = false) Map<String, Boolean> body) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin admin", 404));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));

        boolean newState = (body != null && body.containsKey("isDevTester"))
                ? body.get("isDevTester")
                : !Boolean.TRUE.equals(user.getIsDevTester());

        user.setIsDevTester(newState);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", newState ? "Đã cấp quyền DEV Tester cho người dùng " + user.getFullName() : "Đã hủy quyền DEV Tester của " + user.getFullName(),
                "isDevTester", newState
        ));
    }

    @GetMapping("/lock-reasons")
    public ResponseEntity<List<LockReason>> getLockReasons(
            @RequestParam(value = "role", required = false) String roleStr) {
        
        if (roleStr != null && !roleStr.trim().isEmpty()) {
            Role role;
            try {
                role = Role.valueOf(roleStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new CustomException("Role không hợp lệ: " + roleStr, 400);
            }
            return ResponseEntity.ok(lockReasonRepository.findByRole(role));
        }
        return ResponseEntity.ok(lockReasonRepository.findAll());
    }

    @PostMapping("/lock-reasons")
    public ResponseEntity<?> createLockReason(@RequestBody Map<String, String> body) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin admin", 404));
        
        if (admin.getRole() != Role.SUPER_ADMIN) {
            throw new CustomException("Bạn không có quyền thực hiện thao tác này. Chỉ Super Admin mới có quyền cấu hình lý do khóa.", 403);
        }
        
        String roleStr = body.get("role");
        String reasonText = body.get("reasonText");
        
        if (roleStr == null || roleStr.trim().isEmpty()) {
            throw new CustomException("Loại tài khoản áp dụng (role) là bắt buộc.", 400);
        }
        
        if (reasonText == null || reasonText.trim().isEmpty()) {
            throw new CustomException("Nội dung lý do khóa là bắt buộc.", 400);
        }
        
        Role role;
        try {
            role = Role.valueOf(roleStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new CustomException("Role không hợp lệ: " + roleStr, 400);
        }
        
        LockReason lockReason = LockReason.builder()
                .role(role)
                .reasonText(reasonText.trim())
                .isDefault(false)
                .build();
        lockReasonRepository.save(lockReason);
        
        return ResponseEntity.ok(lockReason);
    }

    @DeleteMapping("/lock-reasons/{id}")
    public ResponseEntity<?> deleteLockReason(@PathVariable("id") Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin admin", 404));
        
        if (admin.getRole() != Role.SUPER_ADMIN) {
            throw new CustomException("Bạn không có quyền thực hiện thao tác này. Chỉ Super Admin mới có quyền cấu hình lý do khóa.", 403);
        }
        
        LockReason reason = lockReasonRepository.findById(id)
                .orElseThrow(() -> new CustomException("Không tìm thấy lý do khóa.", 404));
        
        lockReasonRepository.delete(reason);
        return ResponseEntity.ok(Map.of("message", "Đã xóa lý do khóa thành công."));
    }

    @GetMapping("/registrations")
    public ResponseEntity<List<OwnerRegistration>> getOwnerRegistrations() {
        return ResponseEntity.ok(ownerRegistrationRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/registrations/{id}")
    public ResponseEntity<OwnerRegistration> getOwnerRegistrationDetail(@PathVariable("id") java.util.UUID id) {
        OwnerRegistration registration = ownerRegistrationRepository.findById(id)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin đăng ký.", 404));
        return ResponseEntity.ok(registration);
    }

    @PostMapping("/registrations/{id}/approve")
    public ResponseEntity<?> approveRegistration(@PathVariable("id") java.util.UUID id) {
        String temporaryPassword = authService.approveOwnerRegistration(id);
        return ResponseEntity.ok(Map.of(
            "message", "Đã duyệt đơn đăng ký thành công.",
            "temporaryPassword", temporaryPassword
        ));
    }

    @PostMapping("/registrations/{id}/reject")
    public ResponseEntity<?> rejectRegistration(@PathVariable("id") java.util.UUID id, @RequestBody Map<String, String> body) {
        String reason = body.get("reason");
        if (reason == null || reason.trim().isEmpty()) {
            throw new CustomException("Vui lòng cung cấp lý do từ chối.", 400);
        }
        authService.rejectOwnerRegistration(id, reason.trim());
        return ResponseEntity.ok(Map.of("message", "Đã từ chối đơn đăng ký thành công."));
    }

    @Autowired
    private com.backend.sporta.service.VenueService venueService;

    @GetMapping("/venues/pending")
    public ResponseEntity<List<com.backend.sporta.dto.VenueResponse>> getPendingNewVenues() {
        return ResponseEntity.ok(venueService.getPendingNewVenues());
    }

    @PostMapping("/venues/{id}/approve")
    public ResponseEntity<?> approveNewVenue(@PathVariable("id") java.util.UUID id) {
        venueService.approveNewVenue(id);
        return ResponseEntity.ok(Map.of("message", "Đã phê duyệt cụm sân mới thành công."));
    }

    @PostMapping("/venues/{id}/reject")
    public ResponseEntity<?> rejectNewVenue(@PathVariable("id") java.util.UUID id, @RequestBody Map<String, String> body) {
        String reason = body.get("reason");
        if (reason == null || reason.trim().isEmpty()) {
            throw new CustomException("Vui lòng cung cấp lý do từ chối.", 400);
        }
        venueService.rejectNewVenue(id, reason.trim());
        return ResponseEntity.ok(Map.of("message", "Đã từ chối cụm sân mới thành công."));
    }

    @GetMapping("/venue-revisions/pending")
    public ResponseEntity<List<com.backend.sporta.dto.VenueRevisionResponse>> getPendingVenueRevisions() {
        return ResponseEntity.ok(venueService.getPendingRevisions());
    }

    @PostMapping("/venue-revisions/{id}/approve")
    public ResponseEntity<?> approveVenueRevision(@PathVariable("id") java.util.UUID id) {
        venueService.approveRevision(id);
        return ResponseEntity.ok(Map.of("message", "Đã phê duyệt thay đổi thông tin sân thành công."));
    }

    @PostMapping("/venue-revisions/{id}/reject")
    public ResponseEntity<?> rejectVenueRevision(@PathVariable("id") java.util.UUID id, @RequestBody Map<String, String> body) {
        String reason = body.get("reason");
        if (reason == null || reason.trim().isEmpty()) {
            throw new CustomException("Vui lòng cung cấp lý do từ chối.", 400);
        }
        venueService.rejectRevision(id, reason.trim());
        return ResponseEntity.ok(Map.of("message", "Đã từ chối yêu cầu thay đổi thành công."));
    }

    @Autowired
    private com.backend.sporta.service.AdminDashboardService adminDashboardService;

    @Autowired
    private com.backend.sporta.service.AdminTransactionService adminTransactionService;

    @GetMapping("/dashboard/overview")
    public ResponseEntity<com.backend.sporta.dto.AdminDashboardResponse> getAdminDashboardOverview(
            @RequestParam(value = "timeFilter", required = false, defaultValue = "this_month") String timeFilter) {
        com.backend.sporta.dto.AdminDashboardResponse response = adminDashboardService.getDashboardOverview(timeFilter);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<com.backend.sporta.dto.AdminTransactionResponse>> getAdminTransactions() {
        List<com.backend.sporta.dto.AdminTransactionResponse> response = adminTransactionService.getAdminTransactions();
        return ResponseEntity.ok(response);
    }
}
