package com.example.staff_service.config;

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
                // Endpoints publics (pas d'authentification)
                .requestMatchers("/api/v1/staff/roles").permitAll()
                .requestMatchers("/api/v1/staff/statuses").permitAll()
                .requestMatchers("/api/v1/evaluations/types").permitAll()
                .requestMatchers("/api/v1/evaluations/statuses").permitAll()
                .requestMatchers("/api/v1/schedules/types").permitAll()
                .requestMatchers("/api/v1/schedules/statuses").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/health").permitAll()
                .requestMatchers("/info").permitAll()
                
                // ===== STAFF MANAGEMENT =====
                // Création de staff - ADMIN et SUPERVISEUR uniquement
                .requestMatchers(POST, "/api/v1/staff").hasAnyAuthority("STAFF_CREATE", "STAFF_ADMIN")
                // Modification de staff - ADMIN et SUPERVISEUR uniquement
                .requestMatchers(PUT, "/api/v1/staff/**").hasAnyAuthority("STAFF_UPDATE", "STAFF_ADMIN")
                // Suppression de staff - ADMIN uniquement
                .requestMatchers(DELETE, "/api/v1/staff/**").hasAuthority("STAFF_ADMIN")
                // Lecture de staff - Tous les rôles authentifiés
                .requestMatchers(GET, "/api/v1/staff").hasAnyAuthority("STAFF_READ", "STAFF_UPDATE", "STAFF_CREATE", "STAFF_ADMIN")
                .requestMatchers(GET, "/api/v1/staff/**").hasAnyAuthority("STAFF_READ", "STAFF_UPDATE", "STAFF_CREATE", "STAFF_ADMIN")
                
                // ===== PERFORMANCE EVALUATIONS =====
                // Création d'évaluations - ADMIN et SUPERVISEUR uniquement
                .requestMatchers(POST, "/api/v1/evaluations").hasAnyAuthority("EVALUATION_CREATE", "STAFF_ADMIN")
                // Modification d'évaluations - ADMIN et SUPERVISEUR uniquement
                .requestMatchers(PUT, "/api/v1/evaluations/**").hasAnyAuthority("EVALUATION_UPDATE", "STAFF_ADMIN")
                // Suppression d'évaluations - ADMIN uniquement
                .requestMatchers(DELETE, "/api/v1/evaluations/**").hasAuthority("STAFF_ADMIN")
                // Lecture d'évaluations - Tous les rôles authentifiés
                .requestMatchers(GET, "/api/v1/evaluations/**").hasAnyAuthority("EVALUATION_READ", "EVALUATION_UPDATE", "EVALUATION_CREATE", "STAFF_ADMIN")
                
                // ===== WORK SCHEDULES =====
                // Création d'horaires - ADMIN et SUPERVISEUR uniquement
                .requestMatchers(POST, "/api/v1/schedules").hasAnyAuthority("SCHEDULE_CREATE", "STAFF_ADMIN")
                // Modification d'horaires - ADMIN et SUPERVISEUR uniquement
                .requestMatchers(PUT, "/api/v1/schedules/**").hasAnyAuthority("SCHEDULE_UPDATE", "STAFF_ADMIN")
                // Suppression d'horaires - ADMIN uniquement
                .requestMatchers(DELETE, "/api/v1/schedules/**").hasAuthority("STAFF_ADMIN")
                // Lecture d'horaires - Tous les rôles authentifiés
                .requestMatchers(GET, "/api/v1/schedules/**").hasAnyAuthority("SCHEDULE_READ", "SCHEDULE_UPDATE", "SCHEDULE_CREATE", "STAFF_ADMIN")
                
                // Tous les autres endpoints nécessitent une authentification
                .anyRequest().authenticated()
            );
        
        return http.build();
    }
} 