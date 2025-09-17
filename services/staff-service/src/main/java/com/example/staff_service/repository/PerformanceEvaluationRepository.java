package com.example.staff_service.repository;

import com.example.staff_service.entity.PerformanceEvaluation;
import com.example.staff_service.entity.EvaluationStatus;
import com.example.staff_service.entity.EvaluationType;
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
public interface PerformanceEvaluationRepository extends JpaRepository<PerformanceEvaluation, Long> {
    
    List<PerformanceEvaluation> findByStaffId(Long staffId);
    
    List<PerformanceEvaluation> findByEvaluatorId(Long evaluatorId);
    
    List<PerformanceEvaluation> findByStaffIdAndEvaluationType(Long staffId, EvaluationType evaluationType);
    
    List<PerformanceEvaluation> findByStatus(EvaluationStatus status);
    
    @Query("SELECT pe FROM PerformanceEvaluation pe WHERE pe.staffId = :staffId AND pe.evaluationDate >= :startDate AND pe.evaluationDate <= :endDate")
    List<PerformanceEvaluation> findByStaffIdAndDateRange(@Param("staffId") Long staffId, 
                                                         @Param("startDate") LocalDate startDate, 
                                                         @Param("endDate") LocalDate endDate);
    
    @Query("SELECT pe FROM PerformanceEvaluation pe WHERE pe.evaluationDate >= :startDate AND pe.evaluationDate <= :endDate")
    List<PerformanceEvaluation> findByDateRange(@Param("startDate") LocalDate startDate, 
                                               @Param("endDate") LocalDate endDate);
    
    @Query("SELECT pe FROM PerformanceEvaluation pe WHERE pe.staffId = :staffId ORDER BY pe.evaluationDate DESC")
    Page<PerformanceEvaluation> findLatestByStaffId(@Param("staffId") Long staffId, Pageable pageable);
    
    @Query("SELECT AVG(pe.overallRating) FROM PerformanceEvaluation pe WHERE pe.staffId = :staffId AND pe.status = 'COMPLETED'")
    Double getAverageRatingByStaffId(@Param("staffId") Long staffId);
    
    @Query("SELECT COUNT(pe) FROM PerformanceEvaluation pe WHERE pe.staffId = :staffId AND pe.status = :status")
    Long countByStaffIdAndStatus(@Param("staffId") Long staffId, @Param("status") EvaluationStatus status);
    
    @Query("SELECT pe FROM PerformanceEvaluation pe WHERE pe.staffId = :staffId AND pe.evaluationType = :type ORDER BY pe.evaluationDate DESC LIMIT 1")
    Optional<PerformanceEvaluation> findLatestByStaffIdAndType(@Param("staffId") Long staffId, 
                                                              @Param("type") EvaluationType type);
} 