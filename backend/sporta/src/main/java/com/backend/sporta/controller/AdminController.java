package com.backend.sporta.controller;

import com.backend.sporta.dto.UpdatePermissionRequest;
import com.backend.sporta.entity.RolePermission;
import com.backend.sporta.enums.Role;
import com.backend.sporta.repository.RolePermissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private RolePermissionRepository rolePermissionRepository;

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
}
