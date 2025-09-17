package com.example.staff_service.controller;

import com.example.staff_service.dto.WorkScheduleRequest;
import com.example.staff_service.dto.WorkScheduleResponse;
import com.example.staff_service.entity.ScheduleStatus;
import com.example.staff_service.entity.ScheduleType;
import com.example.staff_service.service.WorkScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/schedules")
@RequiredArgsConstructor
@Slf4j
public class WorkScheduleController {

    private final WorkScheduleService service;

    @GetMapping("/types")
    public ResponseEntity<ScheduleType[]> getScheduleTypes() {
        return ResponseEntity.ok(ScheduleType.values());
    }

    @GetMapping("/statuses")
    public ResponseEntity<ScheduleStatus[]> getScheduleStatuses() {
        return ResponseEntity.ok(ScheduleStatus.values());
    }

    @PostMapping
    public ResponseEntity<WorkScheduleResponse> create(@Valid @RequestBody WorkScheduleRequest request) {
        log.info("Creating work schedule for staff {} on {}", request.getStaffId(), request.getScheduleDate());
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkScheduleResponse> update(@PathVariable Long id, @Valid @RequestBody WorkScheduleRequest request) {
        log.info("Updating work schedule {}", id);
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("Deleting work schedule {}", id);
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkScheduleResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/staff/{staffId}")
    public ResponseEntity<List<WorkScheduleResponse>> getByStaff(@PathVariable Long staffId) {
        return ResponseEntity.ok(service.getByStaff(staffId));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<WorkScheduleResponse>> getByDate(@PathVariable LocalDate date) {
        return ResponseEntity.ok(service.getByDate(date));
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<WorkScheduleResponse>> getByDateRange(@RequestParam LocalDate startDate, @RequestParam LocalDate endDate) {
        return ResponseEntity.ok(service.getByDateRange(startDate, endDate));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<WorkScheduleResponse>> getByStatus(@PathVariable ScheduleStatus status) {
        return ResponseEntity.ok(service.getByStatus(status));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<WorkScheduleResponse>> getByType(@PathVariable ScheduleType type) {
        return ResponseEntity.ok(service.getByType(type));
    }
    
    @GetMapping("/flight/{flightId}")
    public ResponseEntity<List<WorkScheduleResponse>> getByFlight(@PathVariable Long flightId) {
        return ResponseEntity.ok(service.getByFlight(flightId));
    }

    @GetMapping("/staff/{staffId}/latest")
    public ResponseEntity<Page<WorkScheduleResponse>> getLatestByStaff(@PathVariable Long staffId,
                                                                       @RequestParam(defaultValue = "0") int page,
                                                                       @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(service.getLatestByStaff(staffId, page, size));
    }

    @GetMapping("/staff/{staffId}/upcoming")
    public ResponseEntity<List<WorkScheduleResponse>> getUpcomingByStaff(@PathVariable Long staffId) {
        return ResponseEntity.ok(service.getUpcomingByStaff(staffId));
    }
}


