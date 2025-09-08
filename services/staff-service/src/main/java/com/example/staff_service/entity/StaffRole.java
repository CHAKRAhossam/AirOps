package com.example.staff_service.entity;

public enum StaffRole {
    PILOT("Pilot"),
    CO_PILOT("Co-Pilot"),
    FLIGHT_ATTENDANT("Flight Attendant"),
    GROUND_CREW("Ground Crew"),
    MAINTENANCE_TECHNICIAN("Maintenance Technician"),
    SUPERVISOR("Supervisor"),
    MANAGER("Manager"),
    ADMINISTRATIVE("Administrative");
    
    private final String displayName;
    
    StaffRole(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
} 