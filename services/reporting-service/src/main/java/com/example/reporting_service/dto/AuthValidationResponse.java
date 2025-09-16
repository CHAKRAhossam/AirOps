package com.example.reporting_service.dto;

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
    private String email;
    private String role;
    private String message;
}
