package com.backend.sporta.security;

import com.backend.sporta.enums.Role;
import com.backend.sporta.exception.CustomException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class OwnerMobileAppRestrictionInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        // If not authenticated or anonymous, skip
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return true;
        }

        // We only restrict mutating methods
        String method = request.getMethod();
        if ("GET".equalsIgnoreCase(method) || "OPTIONS".equalsIgnoreCase(method) || "HEAD".equalsIgnoreCase(method)) {
            return true;
        }

        // Check if user is OWNER
        boolean isOwner = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_OWNER") || a.getAuthority().equals("OWNER"));
                
        if (!isOwner) {
            return true; // Other roles are unrestricted
        }

        String uri = request.getRequestURI();

        // 1. Allow Owner Portal APIs
        if (uri.startsWith("/api/v1/owner") || uri.startsWith("/api/owner")) {
            return true;
        }

        // 2. Allow Admin Portal APIs
        if (uri.startsWith("/api/v1/admin") || uri.startsWith("/api/admin")) {
            return true;
        }

        // 3. Allow Auth APIs (login, logout, change password)
        if (uri.startsWith("/api/v1/auth") || uri.startsWith("/api/auth")) {
            return true;
        }

        // 4. Allow profile and sports-elo updates (Personal info)
        if (uri.equals("/api/v1/users/profile") || uri.equals("/api/v1/users/sports-elo")) {
            return true;
        }

        // 5. Allow upload APIs (for avatar etc.)
        if (uri.startsWith("/api/v1/upload") || uri.startsWith("/api/upload")) {
            return true;
        }

        // If it's anything else (e.g. creating a match, booking a court, writing a review), BLOCK IT.
        throw new CustomException("Tài khoản chủ sân chỉ có quyền xem thông tin (View-only) trên ứng dụng người chơi. Vui lòng đăng nhập trang Quản lý chủ sân để thực hiện các thao tác nghiệp vụ.", 403);
    }
}
