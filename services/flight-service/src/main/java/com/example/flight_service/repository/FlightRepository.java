package com.example.flight_service.repository;

import com.example.flight_service.entity.Flight;
import com.example.flight_service.entity.FlightStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FlightRepository extends JpaRepository<Flight, Long> {
    
    Optional<Flight> findByFlightNumber(String flightNumber);
    
    List<Flight> findByStatus(FlightStatus status);
    
    List<Flight> findByAirline(String airline);
    
    List<Flight> findByOrigin(String origin);
    
    List<Flight> findByDestination(String destination);
    
    @Query("SELECT f FROM Flight f WHERE f.departureTime BETWEEN :startDate AND :endDate")
    List<Flight> findFlightsByDateRange(@Param("startDate") LocalDateTime startDate, 
                                       @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT f FROM Flight f WHERE f.gate = :gate AND f.status IN ('SCHEDULED', 'BOARDING')")
    List<Flight> findActiveFlightsByGate(@Param("gate") String gate);
    
    boolean existsByFlightNumber(String flightNumber);
} 