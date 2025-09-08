package com.example.staff_service.service;

import com.example.staff_service.dto.StaffRequest;
import com.example.staff_service.dto.StaffResponse;
import com.example.staff_service.entity.Staff;
import com.example.staff_service.entity.StaffRole;
import com.example.staff_service.entity.StaffStatus;
import com.example.staff_service.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class StaffService {
    
    private final StaffRepository staffRepository;
    
    public StaffResponse createStaff(StaffRequest request) {
        log.info("Creating new staff member");
        
        // Auto-generate employee ID
        String employeeId = generateNextEmployeeId();
        log.info("Generated employee ID: {}", employeeId);
        
        // Check if email already exists
        if (staffRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        // Create the staff
        Staff staff = Staff.builder()
                .employeeId(employeeId)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .staffRole(request.getStaffRole())
                .department(request.getDepartment())
                .hireDate(request.getHireDate())
                .status(request.getStatus())
                .build();
        
        Staff savedStaff = staffRepository.save(staff);
        log.info("Staff member created successfully: {}", savedStaff.getEmployeeId());
        
        return mapToStaffResponse(savedStaff);
    }
    
    public StaffResponse updateStaff(Long id, StaffRequest request) {
        log.info("Updating staff member: {}", id);
        
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff member not found"));
        
        // Check uniqueness constraints if fields have changed
        if (!staff.getEmployeeId().equals(request.getEmployeeId()) && 
            staffRepository.existsByEmployeeId(request.getEmployeeId())) {
            throw new RuntimeException("Employee ID already exists");
        }
        
        if (!staff.getEmail().equals(request.getEmail()) && 
            staffRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        // Update fields - preserve existing employeeId if not provided
        if (request.getEmployeeId() != null && !request.getEmployeeId().trim().isEmpty()) {
            staff.setEmployeeId(request.getEmployeeId());
        }
        staff.setFirstName(request.getFirstName());
        staff.setLastName(request.getLastName());
        staff.setEmail(request.getEmail());
        staff.setStaffRole(request.getStaffRole());
        staff.setDepartment(request.getDepartment());
        staff.setHireDate(request.getHireDate());
        staff.setStatus(request.getStatus());
        
        Staff updatedStaff = staffRepository.save(staff);
        log.info("Staff member updated successfully: {}", updatedStaff.getEmployeeId());
        
        return mapToStaffResponse(updatedStaff);
    }
    
    public void deleteStaff(Long id) {
        log.info("Deleting staff member: {}", id);
        
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff member not found"));
        
        staffRepository.delete(staff);
        log.info("Staff member deleted successfully: {}", staff.getEmployeeId());
    }
    
    public StaffResponse getStaffById(Long id) {
        log.info("Retrieving staff member: {}", id);
        
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff member not found"));
        
        return mapToStaffResponse(staff);
    }
    
    public Page<StaffResponse> getAllStaff(Pageable pageable) {
        log.info("Retrieving all staff members");
        
        Page<Staff> staffPage = staffRepository.findAll(pageable);
        return staffPage.map(this::mapToStaffResponse);
    }
    
    public List<StaffResponse> getStaffByRole(StaffRole role) {
        log.info("Retrieving staff members by role: {}", role);
        
        List<Staff> staffList = staffRepository.findByStaffRole(role);
        return staffList.stream()
                .map(this::mapToStaffResponse)
                .collect(Collectors.toList());
    }
    
    public List<StaffResponse> getStaffByStatus(StaffStatus status) {
        log.info("Retrieving staff members by status: {}", status);
        
        List<Staff> staffList = staffRepository.findByStatus(status);
        return staffList.stream()
                .map(this::mapToStaffResponse)
                .collect(Collectors.toList());
    }
    
    public List<StaffResponse> getStaffByHireDateRange(LocalDate startDate, LocalDate endDate) {
        log.info("Retrieving staff members by hire date range: {} - {}", startDate, endDate);
        
        List<Staff> staffList = staffRepository.findByHireDateBetween(startDate, endDate);
        return staffList.stream()
                .map(this::mapToStaffResponse)
                .collect(Collectors.toList());
    }
    
    private StaffResponse mapToStaffResponse(Staff staff) {
        return StaffResponse.builder()
                .id(staff.getId())
                .employeeId(staff.getEmployeeId())
                .firstName(staff.getFirstName())
                .lastName(staff.getLastName())
                .email(staff.getEmail())
                .staffRole(staff.getStaffRole())
                .department(staff.getDepartment())
                .hireDate(staff.getHireDate())
                .status(staff.getStatus())
                .roleDisplayName(staff.getStaffRole().getDisplayName())
                .departmentDisplayName(staff.getDepartment().getDisplayName())
                .statusDisplayName(staff.getStatus().getDisplayName())
                .build();
    }
    
    private String generateNextEmployeeId() {
        List<String> existingIds = staffRepository.findEmployeeIdsOrdered();
        
        if (existingIds.isEmpty()) {
            return "EMP001";
        }
        
        // Get the last employee ID (highest number)
        String lastId = existingIds.get(0);
        
        // Extract the number part and increment it
        try {
            String numberPart = lastId.substring(3); // Remove "EMP" prefix
            int nextNumber = Integer.parseInt(numberPart) + 1;
            return String.format("EMP%03d", nextNumber);
        } catch (Exception e) {
            log.error("Error parsing employee ID: {}", lastId, e);
            // Fallback: generate based on count
            int nextNumber = existingIds.size() + 1;
            return String.format("EMP%03d", nextNumber);
        }
    }
} 