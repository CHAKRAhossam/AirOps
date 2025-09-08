package com.example.staff_service.dto;

import com.example.staff_service.entity.Department;
import com.example.staff_service.entity.StaffRole;
import com.example.staff_service.entity.StaffStatus;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffRequest {
    
    // Employee ID is auto-generated, so this field is optional
    private String employeeId;
    
    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    private String lastName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
    
    @NotNull(message = "Staff role is required")
    private StaffRole staffRole;
    
    @NotNull(message = "Department is required")
    private Department department;
    
    @NotNull(message = "Hire date is required")
    @PastOrPresent(message = "Hire date cannot be in the future")
    private LocalDate hireDate;
    
    @Builder.Default
    private StaffStatus status = StaffStatus.ACTIVE;
} 