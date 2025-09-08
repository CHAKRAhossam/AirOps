package com.example.flight_service.controller;

import com.example.flight_service.dto.FlightRequest;
import com.example.flight_service.dto.FlightResponse;
import com.example.flight_service.dto.FlightStatusRequest;
import com.example.flight_service.entity.FlightStatus;
import com.example.flight_service.service.FlightService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/v1/flights")
@RequiredArgsConstructor
@Slf4j
public class FlightController {
    
    private final FlightService flightService;
    
    // Public endpoints (no authentication required)
    @GetMapping("/statuses")
    public ResponseEntity<List<FlightStatus>> getFlightStatuses() {
        return ResponseEntity.ok(Arrays.asList(FlightStatus.values()));
    }
    
    // Protected endpoints (authentication required)
    @GetMapping
    public ResponseEntity<List<FlightResponse>> getAllFlights() {
        List<FlightResponse> flights = flightService.getAllFlights();
        return ResponseEntity.ok(flights);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<FlightResponse> getFlightById(@PathVariable Long id) {
        FlightResponse flight = flightService.getFlightById(id);
        return ResponseEntity.ok(flight);
    }
    
    @PostMapping
    public ResponseEntity<FlightResponse> createFlight(@RequestBody FlightRequest request) {
        FlightResponse createdFlight = flightService.createFlight(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdFlight);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<FlightResponse> updateFlight(@PathVariable Long id, @RequestBody FlightRequest request) {
        FlightResponse updatedFlight = flightService.updateFlight(id, request);
        return ResponseEntity.ok(updatedFlight);
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateFlightStatus(@PathVariable Long id, @RequestBody FlightStatusRequest request) {
        FlightResponse updatedFlight = flightService.updateFlightStatus(id, request);
        return ResponseEntity.ok(Map.of(
            "message", "Flight status updated successfully",
            "flightId", updatedFlight.getId(),
            "newStatus", updatedFlight.getStatus()
        ));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteFlight(@PathVariable Long id) {
        flightService.deleteFlight(id);
        return ResponseEntity.ok(Map.of("message", "Flight deleted successfully"));
    }
    
    // Additional query endpoints
    @GetMapping("/status/{status}")
    public ResponseEntity<List<FlightResponse>> getFlightsByStatus(@PathVariable FlightStatus status) {
        List<FlightResponse> flights = flightService.getFlightsByStatus(status);
        return ResponseEntity.ok(flights);
    }
    
    @GetMapping("/airline/{airline}")
    public ResponseEntity<List<FlightResponse>> getFlightsByAirline(@PathVariable String airline) {
        List<FlightResponse> flights = flightService.getFlightsByAirline(airline);
        return ResponseEntity.ok(flights);
    }

    @GetMapping("/debug/auth")
    public ResponseEntity<Map<String, Object>> debugAuth(Authentication authentication) {
        Map<String, Object> debugInfo = new HashMap<>();
        if (authentication != null) {
            debugInfo.put("name", authentication.getName());
            debugInfo.put("authorities", authentication.getAuthorities().stream()
                    .map(Object::toString)
                    .collect(Collectors.toList()));
            debugInfo.put("principal", authentication.getPrincipal());
            debugInfo.put("authenticated", authentication.isAuthenticated());
        } else {
            debugInfo.put("authentication", "null");
        }
        return ResponseEntity.ok(debugInfo);
    }
} 