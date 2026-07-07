package com.backend.sporta.controller;

import com.backend.sporta.dto.UpdatePermissionRequest;
import com.backend.sporta.entity.RolePermission;
import com.backend.sporta.entity.User;
import com.backend.sporta.entity.UserStatus;
import com.backend.sporta.entity.LockReason;
import com.backend.sporta.entity.LockLog;
import com.backend.sporta.enums.Role;
import com.backend.sporta.repository.RolePermissionRepository;
import com.backend.sporta.repository.UserRepository;
import com.backend.sporta.repository.LockReasonRepository;
import com.backend.sporta.repository.LockLogRepository;
import com.backend.sporta.exception.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;

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

    @GetMapping("/permissions")
    public ResponseEntity<List<RolePermission>> getAdminPermissions() {
        List<RolePermission> permissions = rolePermissionRepository.findByRole(Role.ADMIN);
        
        // Khởi tạo các quyền mặc định nếu chưa có
        if (permissions.isEmpty()) {
            RolePermission dashboard = RolePermission.builder().role(Role.ADMIN).feature("VIEW_DASHBOARD").isAllowed(true).build();
            RolePermission facilities = RolePermission.builder().role(Role.ADMIN).feature("MANAGE_FACILITIES").isAllowed(true).build();
            RolePermission owners = RolePermission.builder().role(Role.ADMIN).feature("MANAGE_OWNERS").isAllowed(true).build();
            RolePermission users = RolePermission.builder().role(Role.ADMIN).feature("MANAGE_USERS").isAllowed(true).build();
            RolePermission system = RolePermission.builder().role(Role.ADMIN).feature("MANAGE_SYSTEM").isAllowed(false).build();
            
            permissions = rolePermissionRepository.saveAll(List.of(dashboard, facilities, owners, users, system));
        } else {
            // Check missing permissions for older databases
            boolean hasSystem = permissions.stream().anyMatch(p -> p.getFeature().equals("MANAGE_SYSTEM"));
            boolean hasOwners = permissions.stream().anyMatch(p -> p.getFeature().equals("MANAGE_OWNERS"));
            
            if (!hasSystem || !hasOwners) {
                if (!hasSystem) {
                    rolePermissionRepository.save(RolePermission.builder().role(Role.ADMIN).feature("MANAGE_SYSTEM").isAllowed(false).build());
                }
                if (!hasOwners) {
                    rolePermissionRepository.save(RolePermission.builder().role(Role.ADMIN).feature("MANAGE_OWNERS").isAllowed(true).build());
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
                users = userRepository.findAllByOrderByCreatedAtDesc();
            }
        }
        return ResponseEntity.ok(users);
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
}
