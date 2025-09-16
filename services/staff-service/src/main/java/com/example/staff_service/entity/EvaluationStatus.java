package com.example.staff_service.entity;

public enum EvaluationStatus {
    DRAFT("Brouillon"),
    PENDING_REVIEW("En attente de révision"),
    UNDER_REVIEW("En cours de révision"),
    APPROVED("Approuvée"),
    REJECTED("Rejetée"),
    COMPLETED("Terminée"),
    ARCHIVED("Archivée");
    
    private final String displayName;
    
    EvaluationStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
} 