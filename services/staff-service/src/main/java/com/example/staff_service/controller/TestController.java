package com.example.staff_service.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/test")
@RequiredArgsConstructor
@Slf4j
public class TestController {
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        log.info("Test de santé du staff-service");
        
        Map<String, Object> response = new HashMap<>();
        response.put("service", "staff-service");
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now());
        response.put("message", "Staff service is running");
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> info() {
        log.info("Informations du staff-service");
        
        Map<String, Object> response = new HashMap<>();
        response.put("service", "staff-service");
        response.put("version", "1.0.0");
        response.put("description", "Service de gestion du personnel pour AirOps");
        response.put("features", new String[]{
            "Gestion du personnel",
            "Évaluations de performance", 
            "Horaires de travail",
            "Pointage d'entrée/sortie"
        });
        
        return ResponseEntity.ok(response);
    }
} 