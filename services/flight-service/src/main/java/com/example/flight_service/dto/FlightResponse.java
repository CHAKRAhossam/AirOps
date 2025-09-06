package com.example.flight_service.dto;

import com.example.flight_service.entity.FlightStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightResponse {
    private Long id;
    private String flightNumber;
    private String airline;
    private String origin;
    private String destination;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private String gate;
    private FlightStatus status;
    private String aircraftType;
    private String pilotId;
    private String coPilotId;
    private String crewMembers;
    private Integer passengerCount;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 