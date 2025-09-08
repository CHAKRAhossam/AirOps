package com.example.staff_service.entity;

public enum ScheduleStatus {
    SCHEDULED("Planifié"),
    IN_PROGRESS("En cours"),
    COMPLETED("Terminé"),
    CANCELLED("Annulé"),
    MODIFIED("Modifié"),
    PENDING_APPROVAL("En attente d'approbation"),
    APPROVED("Approuvé"),
    REJECTED("Rejeté");
    
    private final String displayName;
    
    ScheduleStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
} 