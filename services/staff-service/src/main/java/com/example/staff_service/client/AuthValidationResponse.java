package com.example.staff_service.client;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthValidationResponse {
    private boolean valid;
    private String message;
    private Long userId;
    private String email;
    private String role;
} 