package com.example.flight_service.config;

import com.example.flight_service.client.AuthServiceClient;
import com.example.flight_service.dto.AuthValidationResponse;
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
    protected void doFilterInternal(HttpServletRequest request, 
                                  HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        try {
            String token = extractToken(request);
            
            if (StringUtils.hasText(token)) {
                log.debug("Processing JWT token for request: {}", request.getRequestURI());
                
                AuthValidationResponse validationResponse = authServiceClient.validateToken("Bearer " + token);
                
                if (validationResponse.isValid()) {
                    List<SimpleGrantedAuthority> authorities = getAuthoritiesForRole(validationResponse.getRole());
                    
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        validationResponse.getEmail(),
                        null,
                        authorities
                    );
                    
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    log.debug("Authenticated user: {} with role: {} and authorities: {} for request: {}", 
                             validationResponse.getEmail(), validationResponse.getRole(), authorities, request.getRequestURI());
                } else {
                    log.warn("Invalid token for request: {} - {}", request.getRequestURI(), validationResponse.getMessage());
                }
            } else {
                log.debug("No JWT token found for request: {}", request.getRequestURI());
            }
        } catch (Exception e) {
            log.error("Error processing JWT token for request: {}", request.getRequestURI(), e);
        }
        
        filterChain.doFilter(request, response);
    }
    
    private List<SimpleGrantedAuthority> getAuthoritiesForRole(String role) {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        
        log.debug("Getting authorities for role: {}", role);
        
        switch (role.toUpperCase()) {
            case "ADMIN":
                // ADMIN has all permissions
                authorities.add(new SimpleGrantedAuthority("FLIGHT_ADMIN"));
                authorities.add(new SimpleGrantedAuthority("FLIGHT_CREATE"));
                authorities.add(new SimpleGrantedAuthority("FLIGHT_UPDATE"));
                authorities.add(new SimpleGrantedAuthority("FLIGHT_READ"));
                authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                log.debug("ADMIN authorities: {}", authorities);
                break;
                
            case "SUPERVISEUR":
                // SUPERVISOR has create, update, and read permissions
                authorities.add(new SimpleGrantedAuthority("FLIGHT_CREATE"));
                authorities.add(new SimpleGrantedAuthority("FLIGHT_UPDATE"));
                authorities.add(new SimpleGrantedAuthority("FLIGHT_READ"));
                authorities.add(new SimpleGrantedAuthority("ROLE_SUPERVISEUR"));
                log.debug("SUPERVISEUR authorities: {}", authorities);
                break;
                
            case "AGENT":
                // AGENT has only read permissions
                authorities.add(new SimpleGrantedAuthority("FLIGHT_READ"));
                authorities.add(new SimpleGrantedAuthority("ROLE_AGENT"));
                log.debug("AGENT authorities: {}", authorities);
                break;
                
            default:
                // Default to read-only access
                authorities.add(new SimpleGrantedAuthority("FLIGHT_READ"));
                authorities.add(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));
                log.debug("DEFAULT authorities for role {}: {}", role, authorities);
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