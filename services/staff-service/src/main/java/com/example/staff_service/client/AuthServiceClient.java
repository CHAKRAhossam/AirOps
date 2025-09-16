package com.example.staff_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "auth-service", url = "${auth-service.url}")
public interface AuthServiceClient {
    
    @PostMapping("/api/v1/auth/validate")
    AuthValidationResponse validateToken(@RequestHeader("Authorization") String token);
    
    @GetMapping("/api/v1/auth/user/{userId}")
    UserResponse getUserById(@PathVariable Long userId, @RequestHeader("Authorization") String token);
    
    @GetMapping("/api/v1/auth/user/me")
    UserResponse getCurrentUser(@RequestHeader("Authorization") String token);
} 