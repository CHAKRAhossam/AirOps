package com.example.auth_service.auth;

import com.example.auth_service.config.JwtService;
import com.example.auth_service.entity.Role;
import com.example.auth_service.entity.User;
import com.example.auth_service.repository.UserRepository;
import com.example.auth_service.token.Token;
import com.example.auth_service.token.TokenRepository;
import com.example.auth_service.token.TokenType;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.ArrayList;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.auth_service.auth.UserResponse;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository repository;
    private final TokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterRequest request) {
        var user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : Role.AGENT)
                .build();
        var savedUser = repository.save(user);
        var jwtToken = jwtService.generateToken(user);
        saveUserToken(savedUser, jwtToken);
        
        UserResponse userResponse = UserResponse.builder()
                .id(String.valueOf(savedUser.getId()))
                .email(savedUser.getEmail())
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .role(savedUser.getRole())
                .build();
                
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .user(userResponse)
                .build();
    }

    public long getUsersCount() {
        return repository.count();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        var user = repository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        var jwtToken = jwtService.generateToken(user);
        revokeAllUserTokens(user);
        saveUserToken(user, jwtToken);
        
        UserResponse userResponse = UserResponse.builder()
                .id(String.valueOf(user.getId()))
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .build();
                
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .user(userResponse)
                .build();
    }

    public AuthValidationResponse validateToken(String token) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return AuthValidationResponse.builder()
                        .valid(false)
                        .message("Token invalide ou manquant")
                        .build();
            }

            String jwtToken = token.substring(7);
            String userEmail = jwtService.extractUsername(jwtToken);
            
            if (userEmail == null) {
                return AuthValidationResponse.builder()
                        .valid(false)
                        .message("Token invalide")
                        .build();
            }

            User user = repository.findByEmail(userEmail).orElse(null);
            
            if (user == null) {
                return AuthValidationResponse.builder()
                        .valid(false)
                        .message("Utilisateur non trouvé")
                        .build();
            }

            if (!jwtService.isTokenValid(jwtToken, user)) {
                return AuthValidationResponse.builder()
                        .valid(false)
                        .message("Token expiré ou invalide")
                        .build();
            }

            return AuthValidationResponse.builder()
                    .valid(true)
                    .message("Token valide")
                    .role(user.getRole().name())
                    .userId((long) user.getId())
                    .email(user.getEmail())
                    .build();

        } catch (Exception e) {
            return AuthValidationResponse.builder()
                    .valid(false)
                    .message("Erreur lors de la validation du token: " + e.getMessage())
                    .build();
        }
    }

    public void logout(String token) {
        try {
            if (token != null && token.startsWith("Bearer ")) {
                String jwtToken = token.substring(7);
                String userEmail = jwtService.extractUsername(jwtToken);
                
                if (userEmail != null) {
                    User user = repository.findByEmail(userEmail).orElse(null);
                    if (user != null) {
                        revokeAllUserTokens(user);
                    }
                }
            }
        } catch (Exception e) {
            // Log error but don't throw to avoid breaking logout flow
            System.err.println("Error during logout: " + e.getMessage());
        }
    }

    private void revokeAllUserTokens(User user) {
        var validUserTokens = tokenRepository.findAllValidTokensByUser(user.getId());
        if (validUserTokens.isEmpty())
            return;
        validUserTokens.forEach(t -> {
            t.setExpired(true);
            t.setRevoked(true);
        });
        tokenRepository.saveAll(validUserTokens);

    }

    private void saveUserToken(User user, String jwtToken) {
        var token = Token.builder()
                .user(user)
                .token(jwtToken)
                .tokenType(TokenType.BEARER)
                .revoked(false)
                .expired(false)
                .build();
        tokenRepository.save(token);
    }

    public List<UserResponse> getAllUsers() {
        return repository.findAll().stream()
                .map(this::mapToUserResponse)
                .toList();
    }

    public UserResponse getUserById(String id) {
        try {
            int userId = Integer.parseInt(id);
            User user = repository.findById(userId)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));
            return mapToUserResponse(user);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid user ID format: " + id);
        }
    }

    public List<UserResponse> getUsersByRole(String role) {
        try {
            Role userRole = Role.valueOf(role.toUpperCase());
            return repository.findByRole(userRole).stream()
                    .map(this::mapToUserResponse)
                    .toList();
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + role);
        }
    }

    public List<String> getAuthoritiesForRole(String role) {
        try {
            Role userRole = Role.valueOf(role.toUpperCase());
            // Build a temporary user with this role to compute authorities consistently
            User user = User.builder().role(userRole).build();
            return user.getAuthorities().stream()
                    .map(a -> a.getAuthority())
                    .toList();
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + role);
        }
    }

    public UserResponse updateUserRole(String id, String role) {
        try {
            int userId = Integer.parseInt(id);
            Role newRole = Role.valueOf(role.toUpperCase());
            User user = repository.findById(userId)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));
            user.setRole(newRole);
            User saved = repository.save(user);
            return mapToUserResponse(saved);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid user ID format: " + id);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + role);
        }
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(String.valueOf(user.getId()))
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}
