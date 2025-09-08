package com.example.staff_service.dto;

import com.example.staff_service.entity.Department;
import com.example.staff_service.entity.StaffRole;
import com.example.staff_service.entity.StaffStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffResponse {
    
    private Long id;
    private String employeeId;
    private String firstName;
    private String lastName;
    private String email;
    private StaffRole staffRole;
    private Department department;
    private StaffStatus status;
    private LocalDate hireDate;
    
    // Display names for better UI
    private String roleDisplayName;
    private String departmentDisplayName;
    private String statusDisplayName;
} 