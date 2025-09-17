package com.example.flight_service.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import static org.springframework.http.HttpMethod.*;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {
    
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(authz -> authz
                // Public endpoints (no authentication required)
                .requestMatchers("/api/v1/flights/statuses").permitAll()
                .requestMatchers("/api/v1/flights/debug/**").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/health").permitAll()
                .requestMatchers("/info").permitAll()
                
                // ===== FLIGHT MANAGEMENT =====
                // Create flights - ADMIN and SUPERVISEUR only
                .requestMatchers(POST, "/api/v1/flights").hasAnyAuthority("FLIGHT_CREATE", "FLIGHT_ADMIN")
                // Update flights - ADMIN and SUPERVISEUR only  
                .requestMatchers(PUT, "/api/v1/flights/**").hasAnyAuthority("FLIGHT_UPDATE", "FLIGHT_ADMIN")
                // Delete flights - ADMIN only
                .requestMatchers(DELETE, "/api/v1/flights/**").hasAuthority("FLIGHT_ADMIN")
                // Read flights - All authenticated roles (including ADMIN, SUPERVISOR, AGENT)
                .requestMatchers(GET, "/api/v1/flights/**").hasAnyAuthority("FLIGHT_READ", "FLIGHT_UPDATE", "FLIGHT_CREATE", "FLIGHT_ADMIN")
                
                // All other endpoints require authentication
                .anyRequest().authenticated()
            );
        
        return http.build();
    }
} 