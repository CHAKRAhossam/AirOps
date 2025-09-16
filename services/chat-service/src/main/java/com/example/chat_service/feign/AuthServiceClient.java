package com.example.chat_service.feign;

import com.example.chat_service.dto.User;
import com.example.chat_service.dto.AuthValidationResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;

@FeignClient(name = "auth-service", url = "${auth.service.url}")
public interface AuthServiceClient {
    
    @GetMapping("/api/v1/auth/users")
    List<User> getAllUsers(@RequestHeader("Authorization") String token);
    
    @GetMapping("/api/v1/auth/users/{id}")
    User getUserById(@PathVariable String id, @RequestHeader("Authorization") String token);
    
    @GetMapping("/api/v1/auth/users/role/{role}")
    List<User> getUsersByRole(@PathVariable String role, @RequestHeader("Authorization") String token);
    
    @PostMapping("/api/v1/auth/validate")
    AuthValidationResponse validateToken(@RequestHeader("Authorization") String token);
}




