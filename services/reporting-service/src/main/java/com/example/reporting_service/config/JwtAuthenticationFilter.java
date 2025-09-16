package com.example.reporting_service.config;

import com.example.reporting_service.feign.AuthServiceClient;
import com.example.reporting_service.dto.AuthValidationResponse;
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
                try {
                    AuthValidationResponse validationResponse = authServiceClient.validateToken("Bearer " + token);
                    if (validationResponse.isValid()) {
                        List<SimpleGrantedAuthority> authorities = getAuthoritiesForRole(validationResponse.getRole());
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                validationResponse.getEmail(), null, authorities);
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        log.debug("Authentication set for user: {}", validationResponse.getEmail());
                    } else {
                        log.debug("Invalid token provided, continuing without authentication");
                    }
                } catch (Exception ex) {
                    log.debug("Error validating token, continuing without authentication: {}", ex.getMessage());
                }
            } else {
                log.debug("No token provided, continuing without authentication");
            }
        } catch (Exception ex) {
            log.error("JWT filter error", ex);
        }

        // Always continue the filter chain
        filterChain.doFilter(request, response);
    }

    private List<SimpleGrantedAuthority> getAuthoritiesForRole(String role) {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        switch (role == null ? "" : role.toUpperCase()) {
            case "ADMIN":
                authorities.add(new SimpleGrantedAuthority("REPORT_ADMIN"));
                authorities.add(new SimpleGrantedAuthority("REPORT_READ"));
                break;
            case "SUPERVISEUR":
            case "SUPERVISOR":
                authorities.add(new SimpleGrantedAuthority("REPORT_READ"));
                break;
            case "AGENT":
                authorities.add(new SimpleGrantedAuthority("REPORT_READ"));
                break;
            default:
                authorities.add(new SimpleGrantedAuthority("REPORT_READ"));
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