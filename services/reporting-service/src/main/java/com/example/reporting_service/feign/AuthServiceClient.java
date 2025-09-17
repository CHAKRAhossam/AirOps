package com.example.reporting_service.feign;

import com.example.reporting_service.dto.AuthValidationResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "auth-service")
public interface AuthServiceClient {
    @PostMapping("/api/v1/auth/validate")
    AuthValidationResponse validateToken(@RequestHeader("Authorization") String token);
}