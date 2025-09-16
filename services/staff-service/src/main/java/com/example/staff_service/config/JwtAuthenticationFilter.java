package com.example.staff_service.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        boolean shouldNotFilter = path.startsWith("/error") || path.startsWith("/actuator") || path.startsWith("/health") || path.startsWith("/info");
        log.info("JWT Filter shouldNotFilter for {}: {} - Method: {}", path, shouldNotFilter, request.getMethod());
        return shouldNotFilter;
    }

    private static final String SECRET_KEY = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                  HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        // Log ALL requests to see what's being processed
        log.info("JWT Filter processing request: {} {} - Method: {} - Path: {}", 
                request.getMethod(), request.getRequestURI(), request.getMethod(), request.getRequestURI());
        
        try {
            String token = extractToken(request);
            
            if (StringUtils.hasText(token)) {
                log.info("Processing JWT token for request: {}", request.getRequestURI());
                
                // Validate JWT token locally
                if (isTokenValid(token)) {
                    try {
                        Claims claims = extractAllClaims(token);
                        String email = claims.getSubject();
                        String role = extractRoleFromClaims(claims);
                        
                        log.info("Token valid for user: {} with role: {}", email, role);
                        
                        List<SimpleGrantedAuthority> authorities = getAuthoritiesForRole(role);
                        
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                            authorities
                        );
                        
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        log.info("Successfully authenticated user: {} with role: {} and authorities: {} for request: {}", 
                                 email, role, authorities, request.getRequestURI());
                    } catch (Exception e) {
                        log.error("Error processing valid token for request: {}", request.getRequestURI(), e);
                    }
                } else {
                    log.warn("Invalid token for request: {}", request.getRequestURI());
                }
            } else {
                log.info("No JWT token found for request: {}", request.getRequestURI());
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
                authorities.add(new SimpleGrantedAuthority("STAFF_ADMIN"));
                authorities.add(new SimpleGrantedAuthority("STAFF_CREATE"));
                authorities.add(new SimpleGrantedAuthority("STAFF_UPDATE"));
                authorities.add(new SimpleGrantedAuthority("STAFF_READ"));
                authorities.add(new SimpleGrantedAuthority("EVALUATION_CREATE"));
                authorities.add(new SimpleGrantedAuthority("EVALUATION_UPDATE"));
                authorities.add(new SimpleGrantedAuthority("EVALUATION_READ"));
                authorities.add(new SimpleGrantedAuthority("SCHEDULE_CREATE"));
                authorities.add(new SimpleGrantedAuthority("SCHEDULE_UPDATE"));
                authorities.add(new SimpleGrantedAuthority("SCHEDULE_READ"));
                authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                log.debug("ADMIN authorities: {}", authorities);
                break;
                
            case "SUPERVISEUR":
                // SUPERVISOR has create, update, and read permissions
                authorities.add(new SimpleGrantedAuthority("STAFF_CREATE"));
                authorities.add(new SimpleGrantedAuthority("STAFF_UPDATE"));
                authorities.add(new SimpleGrantedAuthority("STAFF_READ"));
                authorities.add(new SimpleGrantedAuthority("EVALUATION_CREATE"));
                authorities.add(new SimpleGrantedAuthority("EVALUATION_UPDATE"));
                authorities.add(new SimpleGrantedAuthority("EVALUATION_READ"));
                authorities.add(new SimpleGrantedAuthority("SCHEDULE_CREATE"));
                authorities.add(new SimpleGrantedAuthority("SCHEDULE_UPDATE"));
                authorities.add(new SimpleGrantedAuthority("SCHEDULE_READ"));
                authorities.add(new SimpleGrantedAuthority("ROLE_SUPERVISEUR"));
                log.debug("SUPERVISEUR authorities: {}", authorities);
                break;
                
            case "AGENT":
                // AGENT has only read permissions
                authorities.add(new SimpleGrantedAuthority("STAFF_READ"));
                authorities.add(new SimpleGrantedAuthority("EVALUATION_READ"));
                authorities.add(new SimpleGrantedAuthority("SCHEDULE_READ"));
                authorities.add(new SimpleGrantedAuthority("ROLE_AGENT"));
                log.debug("AGENT authorities: {}", authorities);
                break;
                
            default:
                // Default to read-only access
                authorities.add(new SimpleGrantedAuthority("STAFF_READ"));
                authorities.add(new SimpleGrantedAuthority("EVALUATION_READ"));
                authorities.add(new SimpleGrantedAuthority("SCHEDULE_READ"));
                authorities.add(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));
                log.debug("DEFAULT authorities for role {}: {}", role, authorities);
                break;
        }
        
        return authorities;
    }
    
    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        log.info("Authorization header: {}", bearerToken);
        
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            log.info("Extracted token (first 20 chars): {}", token.substring(0, Math.min(20, token.length())));
            return token;
        }
        return null;
    }
    
    private boolean isTokenValid(String token) {
        try {
            boolean valid = !isTokenExpired(token);
            log.info("Token validation result: {}", valid);
            return valid;
        } catch (Exception e) {
            log.error("Error validating token", e);
            return false;
        }
    }
    
    private boolean isTokenExpired(String token) {
        Claims claims = extractAllClaims(token);
        return claims.getExpiration().before(new java.util.Date());
    }
    
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    
    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
    
    private String extractRoleFromClaims(Claims claims) {
        // Extract role from authorities claim
        List<String> authorities = claims.get("authorities", List.class);
        log.info("Extracted authorities from JWT: {}", authorities);
        
        if (authorities != null) {
            for (String authority : authorities) {
                if (authority.startsWith("ROLE_")) {
                    String role = authority.substring(5); // Remove "ROLE_" prefix
                    log.info("Found role: {} from authority: {}", role, authority);
                    return role;
                }
            }
        }
        
        log.warn("No ROLE_ authority found in JWT, defaulting to AGENT. Authorities: {}", authorities);
        return "AGENT"; // Default role
    }
} 