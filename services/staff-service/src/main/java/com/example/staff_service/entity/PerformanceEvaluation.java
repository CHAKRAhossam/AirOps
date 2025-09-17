package com.example.staff_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "performance_evaluations")
@EntityListeners(AuditingEntityListener.class)
public class PerformanceEvaluation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "staff_id", nullable = false)
    private Long staffId;
    
    @Column(name = "evaluator_id", nullable = false)
    private Long evaluatorId; // ID du staff qui fait l'évaluation
    
    @Column(name = "evaluation_date", nullable = false)
    private LocalDate evaluationDate;
    
    @Column(name = "evaluation_period_start")
    private LocalDate evaluationPeriodStart;
    
    @Column(name = "evaluation_period_end")
    private LocalDate evaluationPeriodEnd;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "evaluation_type", nullable = false)
    private EvaluationType evaluationType;
    
    @Column(name = "overall_rating")
    private Integer overallRating; // 1-5 scale
    
    @Column(name = "technical_skills_rating")
    private Integer technicalSkillsRating;
    
    @Column(name = "communication_skills_rating")
    private Integer communicationSkillsRating;
    
    @Column(name = "teamwork_rating")
    private Integer teamworkRating;
    
    @Column(name = "reliability_rating")
    private Integer reliabilityRating;
    
    @Column(name = "initiative_rating")
    private Integer initiativeRating;
    
    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;
    
    @Column(name = "strengths", columnDefinition = "TEXT")
    private String strengths;
    
    @Column(name = "areas_for_improvement", columnDefinition = "TEXT")
    private String areasForImprovement;
    
    @Column(name = "goals_for_next_period", columnDefinition = "TEXT")
    private String goalsForNextPeriod;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private EvaluationStatus status;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
} 