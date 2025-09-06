package com.example.flight_service.service;

import com.example.flight_service.dto.FlightRequest;
import com.example.flight_service.dto.FlightResponse;
import com.example.flight_service.dto.FlightStatusRequest;
import com.example.flight_service.entity.Flight;
import com.example.flight_service.entity.FlightStatus;
import com.example.flight_service.repository.FlightRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FlightService {
    
    private final FlightRepository flightRepository;
    
    public List<FlightResponse> getAllFlights() {
        return flightRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public FlightResponse getFlightById(Long id) {
        Flight flight = flightRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Flight not found with id: " + id));
        return mapToResponse(flight);
    }
    
    public FlightResponse createFlight(FlightRequest request) {
        if (flightRepository.existsByFlightNumber(request.getFlightNumber())) {
            throw new RuntimeException("Flight with number " + request.getFlightNumber() + " already exists");
        }
        
        Flight flight = Flight.builder()
                .flightNumber(request.getFlightNumber())
                .airline(request.getAirline())
                .origin(request.getOrigin())
                .destination(request.getDestination())
                .departureTime(request.getDepartureTime())
                .arrivalTime(request.getArrivalTime())
                .gate(request.getGate())
                .status(request.getStatus() != null ? request.getStatus() : FlightStatus.SCHEDULED)
                .aircraftType(request.getAircraftType())
                .pilotId(request.getPilotId())
                .coPilotId(request.getCoPilotId())
                .crewMembers(request.getCrewMembers())
                .passengerCount(request.getPassengerCount())
                .notes(request.getNotes())
                .build();
        
        Flight savedFlight = flightRepository.save(flight);
        log.info("Created flight: {}", savedFlight.getFlightNumber());
        return mapToResponse(savedFlight);
    }
    
    public FlightResponse updateFlight(Long id, FlightRequest request) {
        Flight flight = flightRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Flight not found with id: " + id));
        
        flight.setFlightNumber(request.getFlightNumber());
        flight.setAirline(request.getAirline());
        flight.setOrigin(request.getOrigin());
        flight.setDestination(request.getDestination());
        flight.setDepartureTime(request.getDepartureTime());
        flight.setArrivalTime(request.getArrivalTime());
        flight.setGate(request.getGate());
        flight.setStatus(request.getStatus());
        flight.setAircraftType(request.getAircraftType());
        flight.setPilotId(request.getPilotId());
        flight.setCoPilotId(request.getCoPilotId());
        flight.setCrewMembers(request.getCrewMembers());
        flight.setPassengerCount(request.getPassengerCount());
        flight.setNotes(request.getNotes());
        
        Flight updatedFlight = flightRepository.save(flight);
        log.info("Updated flight: {}", updatedFlight.getFlightNumber());
        return mapToResponse(updatedFlight);
    }
    
    public FlightResponse updateFlightStatus(Long id, FlightStatusRequest request) {
        Flight flight = flightRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Flight not found with id: " + id));
        
        flight.setStatus(request.getStatus());
        Flight updatedFlight = flightRepository.save(flight);
        
        log.info("Updated flight {} status to: {}", flight.getFlightNumber(), request.getStatus());
        return mapToResponse(updatedFlight);
    }
    
    public void deleteFlight(Long id) {
        Flight flight = flightRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Flight not found with id: " + id));
        
        flightRepository.delete(flight);
        log.info("Deleted flight: {}", flight.getFlightNumber());
    }
    
    public List<FlightResponse> getFlightsByStatus(FlightStatus status) {
        return flightRepository.findByStatus(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public List<FlightResponse> getFlightsByAirline(String airline) {
        return flightRepository.findByAirline(airline).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    private FlightResponse mapToResponse(Flight flight) {
        return FlightResponse.builder()
                .id(flight.getId())
                .flightNumber(flight.getFlightNumber())
                .airline(flight.getAirline())
                .origin(flight.getOrigin())
                .destination(flight.getDestination())
                .departureTime(flight.getDepartureTime())
                .arrivalTime(flight.getArrivalTime())
                .gate(flight.getGate())
                .status(flight.getStatus())
                .aircraftType(flight.getAircraftType())
                .pilotId(flight.getPilotId())
                .coPilotId(flight.getCoPilotId())
                .crewMembers(flight.getCrewMembers())
                .passengerCount(flight.getPassengerCount())
                .notes(flight.getNotes())
                .createdAt(flight.getCreatedAt())
                .updatedAt(flight.getUpdatedAt())
                .build();
    }
} 