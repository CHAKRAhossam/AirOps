package com.example.chat_service.config;

import com.example.chat_service.feign.AuthServiceClient;
import com.example.chat_service.dto.AuthValidationResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final AuthServiceClient authServiceClient;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String token = extractToken(request);
            if (StringUtils.hasText(token)) {
                AuthValidationResponse validationResponse = authServiceClient.validateToken("Bearer " + token);
                if (validationResponse.isValid()) {
                    List<SimpleGrantedAuthority> authorities = getAuthoritiesForRole(validationResponse.getRole());
                    // Use user ID instead of email for consistent identification
                    String userId = String.valueOf(validationResponse.getUserId());
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userId, null, authorities);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (Exception ex) {
            log.error("JWT filter error", ex);
        }
        filterChain.doFilter(request, response);
    }

    private List<SimpleGrantedAuthority> getAuthoritiesForRole(String role) {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        switch (role == null ? "" : role.toUpperCase()) {
            case "ADMIN":
                authorities.add(new SimpleGrantedAuthority("CHAT_ADMIN"));
                authorities.add(new SimpleGrantedAuthority("CHAT_READ"));
                authorities.add(new SimpleGrantedAuthority("CHAT_CREATE"));
                authorities.add(new SimpleGrantedAuthority("CHAT_SEND"));
                break;
            case "SUPERVISEUR":
            case "SUPERVISOR":
                authorities.add(new SimpleGrantedAuthority("CHAT_READ"));
                authorities.add(new SimpleGrantedAuthority("CHAT_CREATE"));
                authorities.add(new SimpleGrantedAuthority("CHAT_SEND"));
                break;
            case "AGENT":
                authorities.add(new SimpleGrantedAuthority("CHAT_READ"));
                authorities.add(new SimpleGrantedAuthority("CHAT_SEND"));
                break;
            default:
                authorities.add(new SimpleGrantedAuthority("CHAT_READ"));
                authorities.add(new SimpleGrantedAuthority("CHAT_SEND"));
                break;
        }
        return authorities;
    }

    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}