package com.example.staff_service.controller;

import com.example.staff_service.dto.StaffRequest;
import com.example.staff_service.dto.StaffResponse;
import com.example.staff_service.entity.StaffRole;
import com.example.staff_service.entity.StaffStatus;
import com.example.staff_service.service.StaffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/staff")
@RequiredArgsConstructor
@Slf4j
public class StaffController {
    
    private final StaffService staffService;
    
    @PostMapping
    public ResponseEntity<StaffResponse> createStaff(@Valid @RequestBody StaffRequest request) {
        log.info("Creating new staff member");
        StaffResponse response = staffService.createStaff(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<StaffResponse> updateStaff(
            @PathVariable Long id,
            @Valid @RequestBody StaffRequest request) {
        log.info("Updating staff member: {}", id);
        StaffResponse response = staffService.updateStaff(id, request);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStaff(@PathVariable Long id) {
        log.info("Deleting staff member: {}", id);
        staffService.deleteStaff(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<StaffResponse> getStaffById(@PathVariable Long id) {
        log.info("Retrieving staff member: {}", id);
        StaffResponse response = staffService.getStaffById(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    public ResponseEntity<Page<StaffResponse>> getAllStaff(Pageable pageable) {
        log.info("Retrieving all staff members");
        Page<StaffResponse> response = staffService.getAllStaff(pageable);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/role/{role}")
    public ResponseEntity<List<StaffResponse>> getStaffByRole(@PathVariable StaffRole role) {
        log.info("Retrieving staff members by role: {}", role);
        List<StaffResponse> response = staffService.getStaffByRole(role);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<StaffResponse>> getStaffByStatus(@PathVariable StaffStatus status) {
        log.info("Retrieving staff members by status: {}", status);
        List<StaffResponse> response = staffService.getStaffByStatus(status);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/hire-date")
    public ResponseEntity<List<StaffResponse>> getStaffByHireDateRange(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        log.info("Retrieving staff members by hire date range: {} - {}", startDate, endDate);
        List<StaffResponse> response = staffService.getStaffByHireDateRange(startDate, endDate);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/roles")
    public ResponseEntity<StaffRole[]> getAllRoles() {
        log.info("Retrieving all staff roles");
        return ResponseEntity.ok(StaffRole.values());
    }
    
    @GetMapping("/statuses")
    public ResponseEntity<StaffStatus[]> getAllStatuses() {
        log.info("Retrieving all staff statuses");
        return ResponseEntity.ok(StaffStatus.values());
    }
    
    @GetMapping("/departments")
    public ResponseEntity<com.example.staff_service.entity.Department[]> getAllDepartments() {
        log.info("Retrieving all departments");
        return ResponseEntity.ok(com.example.staff_service.entity.Department.values());
    }
} 