package com.example.flight_service.dto;

import com.example.flight_service.entity.FlightStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightStatusRequest {
    private FlightStatus status;
    private String reason;
} 