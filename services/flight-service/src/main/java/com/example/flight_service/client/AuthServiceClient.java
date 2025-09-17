package com.example.flight_service.client;

import com.example.flight_service.dto.AuthValidationResponse;
import com.example.flight_service.dto.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "auth-service", url = "${auth.service.url}")
public interface AuthServiceClient {
    
    @PostMapping("/api/v1/auth/validate")
    AuthValidationResponse validateToken(@RequestHeader("Authorization") String token);
    
    @GetMapping("/api/v1/auth/users/{userId}")
    UserResponse getUserById(@PathVariable Long userId, @RequestHeader("Authorization") String token);
    
    @GetMapping("/api/v1/auth/me")
    UserResponse getCurrentUser(@RequestHeader("Authorization") String token);
} 