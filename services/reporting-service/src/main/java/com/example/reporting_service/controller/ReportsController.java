package com.example.reporting_service.controller;

import com.example.reporting_service.feign.FlightServiceClient;
import com.example.reporting_service.feign.StaffServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/v1/reports", "/reports"})
@RequiredArgsConstructor
@Slf4j
public class ReportsController {

    private final FlightServiceClient flightServiceClient;
    private final StaffServiceClient staffServiceClient;

    @GetMapping("/flights")
    public ResponseEntity<Map<String, Object>> getFlightReports(@RequestHeader(value = "Authorization", required = false) String token) {
        log.info("Fetching flight statistics report");
        List<Map<String, Object>> flights = flightServiceClient.getFlights();

        Map<String, Long> byStatus = flights.stream()
                .collect(Collectors.groupingBy(m -> String.valueOf(m.getOrDefault("status", "UNKNOWN")), Collectors.counting()));

        Map<String, Long> byAirline = flights.stream()
                .collect(Collectors.groupingBy(m -> String.valueOf(m.getOrDefault("airline", "UNKNOWN")), Collectors.counting()));

        Map<String, Object> report = new HashMap<>();
        report.put("totalFlights", flights.size());
        report.put("byStatus", byStatus);
        report.put("byAirline", byAirline);
        report.put("sample", flights.stream().limit(10).collect(Collectors.toList()));

        return ResponseEntity.ok(report);
    }

    @GetMapping("/staff")
    public ResponseEntity<Object> getStaffReports(@RequestHeader(value = "Authorization", required = false) String token) {
        log.info("Fetching staff data report");
        Object staff = staffServiceClient.getAllStaff();
        return ResponseEntity.ok(staff);
    }

    @GetMapping("/metrics/realtime")
    public ResponseEntity<Map<String, Object>> getRealTimeMetrics(@RequestHeader(value = "Authorization", required = false) String token) {
        log.info("Fetching real-time metrics");

        // Get current data
        List<Map<String, Object>> flights = flightServiceClient.getFlights();
        Object staff = staffServiceClient.getAllStaff();

        // Calculate real-time metrics
        long activeFlights = flights.stream()
                .filter(f -> "SCHEDULED".equals(f.get("status")) || "BOARDING".equals(f.get("status")))
                .count();

        long delayedFlights = flights.stream()
                .filter(f -> "DELAYED".equals(f.get("status")))
                .count();

        long cancelledFlights = flights.stream()
                .filter(f -> "CANCELLED".equals(f.get("status")))
                .count();

        // For now, we'll use mock data for staff and system health
        // In a real implementation, this would come from actual staff service data
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("activeFlights", activeFlights);
        metrics.put("delayedFlights", delayedFlights);
        metrics.put("cancelledFlights", cancelledFlights);
        metrics.put("activeStaff", 591); // Mock data for now
        metrics.put("systemHealth", "OPERATIONAL");
        metrics.put("lastUpdated", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/trends")
    public ResponseEntity<Map<String, Object>> getPerformanceTrends(
            @RequestParam(defaultValue = "6months") String period,
            @RequestHeader(value = "Authorization", required = false) String token) {
        log.info("Fetching performance trends for period: {}", period);

        // Get current data
        List<Map<String, Object>> flights = flightServiceClient.getFlights();

        // Generate mock trend data based on period
        // In a real implementation, this would query historical data
        Map<String, Object> trends = new HashMap<>();

        // Flight performance trends (mock data for now)
        List<Map<String, Object>> flightPerformance = List.of(
                Map.of("month", "Jan", "onTime", 92, "delayed", 6, "cancelled", 2, "total", 245),
                Map.of("month", "Feb", "onTime", 89, "delayed", 8, "cancelled", 3, "total", 238),
                Map.of("month", "Mar", "onTime", 94, "delayed", 4, "cancelled", 2, "total", 267),
                Map.of("month", "Apr", "onTime", 91, "delayed", 7, "cancelled", 2, "total", 251),
                Map.of("month", "May", "onTime", 96, "delayed", 3, "cancelled", 1, "total", 289),
                Map.of("month", "Jun", "onTime", 93, "delayed", 5, "cancelled", 2, "total", 276)
        );

        // Staff performance trends (mock data for now)
        List<Map<String, Object>> staffPerformance = List.of(
                Map.of("month", "Jan", "active", 156, "onLeave", 12, "performance", 94),
                Map.of("month", "Feb", "active", 158, "onLeave", 11, "performance", 95),
                Map.of("month", "Mar", "active", 162, "onLeave", 10, "performance", 96),
                Map.of("month", "Apr", "active", 159, "onLeave", 13, "performance", 93),
                Map.of("month", "May", "active", 165, "onLeave", 9, "performance", 97),
                Map.of("month", "Jun", "active", 168, "onLeave", 8, "performance", 98)
        );

        // Revenue trends (mock data for now)
        List<Map<String, Object>> revenue = List.of(
                Map.of("month", "Jan", "revenue", 4.2, "costs", 3.1, "profit", 1.1),
                Map.of("month", "Feb", "revenue", 3.9, "costs", 2.9, "profit", 1.0),
                Map.of("month", "Mar", "revenue", 4.8, "costs", 3.4, "profit", 1.4),
                Map.of("month", "Apr", "revenue", 4.5, "costs", 3.2, "profit", 1.3),
                Map.of("month", "May", "revenue", 5.2, "costs", 3.6, "profit", 1.6),
                Map.of("month", "Jun", "revenue", 4.9, "costs", 3.3, "profit", 1.6)
        );

        trends.put("flightPerformance", flightPerformance);
        trends.put("staffPerformance", staffPerformance);
        trends.put("revenue", revenue);

        return ResponseEntity.ok(trends);
    }

    @GetMapping("/{type}/export")
    public ResponseEntity<Map<String, Object>> exportReport(
            @RequestParam String format,
            @RequestParam(defaultValue = "6months") String period,
            @RequestHeader(value = "Authorization", required = false) String token) {
        log.info("Exporting {} report as {} for period: {}", format, period);

        // For now, return a mock export response
        // In a real implementation, this would generate actual PDF/Excel files
        Map<String, Object> exportResponse = new HashMap<>();
        exportResponse.put("message", "Export functionality will be implemented in future versions");
        exportResponse.put("type", "mock");
        exportResponse.put("format", format);
        exportResponse.put("period", period);
        exportResponse.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        return ResponseEntity.ok(exportResponse);
    }
}