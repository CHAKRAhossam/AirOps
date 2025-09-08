package com.example.staff_service.repository;

import com.example.staff_service.entity.Staff;
import com.example.staff_service.entity.StaffRole;
import com.example.staff_service.entity.StaffStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {
    
    Optional<Staff> findByEmployeeId(String employeeId);
    
    Optional<Staff> findByEmail(String email);
    
    List<Staff> findByStaffRole(StaffRole staffRole);
    
    List<Staff> findByStatus(StaffStatus status);
    
    @Query("SELECT s FROM Staff s WHERE s.hireDate >= :startDate AND s.hireDate <= :endDate")
    List<Staff> findByHireDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    boolean existsByEmployeeId(String employeeId);
    
    boolean existsByEmail(String email);
    
    @Query("SELECT s.employeeId FROM Staff s WHERE s.employeeId LIKE 'EMP%' ORDER BY s.employeeId DESC")
    List<String> findEmployeeIdsOrdered();
} 