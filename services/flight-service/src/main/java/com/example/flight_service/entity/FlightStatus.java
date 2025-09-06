package com.example.flight_service.entity;

public enum FlightStatus {
    SCHEDULED("Programmé"),
    BOARDING("Embarquement"),
    DELAYED("Retardé"),
    CANCELLED("Annulé"),
    LANDED("Atterri"),
    DEPARTED("Décollé"),
    ARRIVED("Arrivé");
    
    private final String displayName;
    
    FlightStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
} 