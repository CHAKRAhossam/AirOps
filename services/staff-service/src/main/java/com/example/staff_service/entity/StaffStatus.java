package com.example.staff_service.entity;

public enum StaffStatus {
    ACTIVE("Active"),
    INACTIVE("Inactive"),
    ON_LEAVE("On Leave"),
    SUSPENDED("Suspended"),
    TERMINATED("Terminated");
    
    private final String displayName;
    
    StaffStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
} 