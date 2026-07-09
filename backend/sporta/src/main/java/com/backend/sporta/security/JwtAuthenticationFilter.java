package com.backend.sporta.security;

import com.backend.sporta.service.TokenBlacklistService;
import com.backend.sporta.entity.User;
import com.backend.sporta.entity.UserStatus;
import com.backend.sporta.entity.LockLog;
import com.backend.sporta.repository.UserRepository;
import com.backend.sporta.repository.LockLogRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LockLogRepository lockLogRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        boolean isBanned = false;
        String bannedMessage = "";
        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt) && !tokenBlacklistService.isBlacklisted(jwt)) {
                String email = tokenProvider.getEmailFromToken(jwt);
                
                User user = userRepository.findByEmail(email).orElse(null);
                if (user != null) {
                    if (user.getIsDeleted() || user.getStatus() == UserStatus.INACTIVE || user.getStatus() == UserStatus.BANNED) {
                        isBanned = true;
                        if (user.getStatus() == UserStatus.BANNED) {
                            LockLog latestLog = lockLogRepository.findFirstByUserIdAndActionOrderByCreatedAtDesc(user.getId(), "LOCK")
                                    .orElse(null);
                            String reason = latestLog != null
                                    ? latestLog.getReasonCategory() + " - " + latestLog.getReasonDetail()
                                    : "Không xác định";
                            bannedMessage = String.format(
                                "{\"message\": \"Tài khoản của bạn đã bị khóa. Lý do: %s. Vui lòng liên hệ hotline Sporta để được hỗ trợ.\"}",
                                reason
                            );
                        } else {
                            bannedMessage = "{\"message\": \"Tài khoản của bạn đã bị ngừng hoạt động hoặc xóa.\"}";
                        }
                    } else {
                        String role = tokenProvider.getRoleFromToken(jwt);
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                email, null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                        );
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            }
        } catch (Exception ex) {
            // Ignore/allow security configuration to handle unauthorized requests
        }

        if (isBanned) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(bannedMessage);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
