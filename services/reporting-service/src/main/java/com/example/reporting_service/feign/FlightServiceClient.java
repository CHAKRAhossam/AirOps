package com.example.reporting_service.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import java.util.List;
import java.util.Map;

@FeignClient(name = "flight-service")
public interface FlightServiceClient {
    @GetMapping("/api/v1/flights")
    List<Map<String, Object>> getFlights();
}