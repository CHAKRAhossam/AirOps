package com.example.staff_service.entity;

public enum EvaluationType {
    ANNUAL("Évaluation annuelle"),
    QUARTERLY("Évaluation trimestrielle"),
    MONTHLY("Évaluation mensuelle"),
    PROBATION("Évaluation de période d'essai"),
    TRAINING("Évaluation de formation"),
    PROJECT("Évaluation de projet"),
    INCIDENT("Évaluation d'incident"),
    PROMOTION("Évaluation de promotion");
    
    private final String displayName;
    
    EvaluationType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
} 