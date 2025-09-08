package com.example.staff_service.repository;

import com.example.staff_service.entity.WorkSchedule;
import com.example.staff_service.entity.ScheduleStatus;
import com.example.staff_service.entity.ScheduleType;
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
public interface WorkScheduleRepository extends JpaRepository<WorkSchedule, Long> {
    
    List<WorkSchedule> findByStaffId(Long staffId);
    
    List<WorkSchedule> findByStaffIdAndScheduleDate(Long staffId, LocalDate scheduleDate);
    
    List<WorkSchedule> findByStaffIdAndScheduleDateBetween(Long staffId, LocalDate startDate, LocalDate endDate);
    
    List<WorkSchedule> findByScheduleDate(LocalDate scheduleDate);
    
    List<WorkSchedule> findByScheduleDateBetween(LocalDate startDate, LocalDate endDate);
    
    List<WorkSchedule> findByStatus(ScheduleStatus status);
    
    List<WorkSchedule> findByScheduleType(ScheduleType scheduleType);
    
    List<WorkSchedule> findByFlightId(Long flightId);
    
    @Query("SELECT ws FROM WorkSchedule ws WHERE ws.staffId = :staffId AND ws.scheduleDate >= :startDate AND ws.scheduleDate <= :endDate")
    List<WorkSchedule> findByStaffIdAndDateRange(@Param("staffId") Long staffId, 
                                                 @Param("startDate") LocalDate startDate, 
                                                 @Param("endDate") LocalDate endDate);
    
    @Query("SELECT ws FROM WorkSchedule ws WHERE ws.staffId = :staffId AND ws.status = :status")
    List<WorkSchedule> findByStaffIdAndStatus(@Param("staffId") Long staffId, @Param("status") ScheduleStatus status);
    
    @Query("SELECT ws FROM WorkSchedule ws WHERE ws.staffId = :staffId AND ws.scheduleType = :type")
    List<WorkSchedule> findByStaffIdAndType(@Param("staffId") Long staffId, @Param("type") ScheduleType type);
    
    @Query("SELECT ws FROM WorkSchedule ws WHERE ws.scheduleDate = :date AND ws.status = :status")
    List<WorkSchedule> findByDateAndStatus(@Param("date") LocalDate date, @Param("status") ScheduleStatus status);
    
    @Query("SELECT COUNT(ws) FROM WorkSchedule ws WHERE ws.staffId = :staffId AND ws.scheduleDate >= :startDate AND ws.scheduleDate <= :endDate")
    Long countByStaffIdAndDateRange(@Param("staffId") Long staffId, 
                                    @Param("startDate") LocalDate startDate, 
                                    @Param("endDate") LocalDate endDate);
    
    @Query("SELECT ws FROM WorkSchedule ws WHERE ws.staffId = :staffId ORDER BY ws.scheduleDate DESC, ws.startTime ASC")
    Page<WorkSchedule> findLatestByStaffId(@Param("staffId") Long staffId, Pageable pageable);
    
    @Query("SELECT ws FROM WorkSchedule ws WHERE ws.staffId = :staffId AND ws.scheduleDate >= :date ORDER BY ws.scheduleDate ASC, ws.startTime ASC")
    List<WorkSchedule> findUpcomingByStaffId(@Param("staffId") Long staffId, @Param("date") LocalDate date);
} 