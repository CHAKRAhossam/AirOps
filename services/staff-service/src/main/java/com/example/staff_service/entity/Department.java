package com.example.staff_service.entity;

public enum Department {
    FLIGHT_OPERATIONS("Flight Operations"),
    MAINTENANCE("Maintenance"),
    CUSTOMER_SERVICE("Customer Service"),
    ADMINISTRATION("Administration"),
    HUMAN_RESOURCES("Human Resources"),
    IT("Information Technology");
    
    private final String displayName;
    
    Department(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
} 