package com.example.staff_service.entity;

public enum ScheduleType {
    REGULAR("Horaire régulier"),
    OVERTIME("Heures supplémentaires"),
    NIGHT_SHIFT("Équipe de nuit"),
    WEEKEND("Weekend"),
    HOLIDAY("Jours fériés"),
    ON_CALL("De garde"),
    TRAINING("Formation"),
    MEETING("Réunion"),
    BREAK("Pause"),
    LEAVE("Congé"),
    SICK_LEAVE("Congé maladie"),
    VACATION("Vacances");
    
    private final String displayName;
    
    ScheduleType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
} 