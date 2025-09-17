package com.example.reporting_service.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "staff-service")
public interface StaffServiceClient {
    @GetMapping("/api/v1/staff")
    Object getAllStaff();
}