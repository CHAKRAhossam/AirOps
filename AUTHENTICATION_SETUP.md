# AirOps Authentication Setup

This document describes how the authentication system is set up and how to test it.

## Overview

The AirOps application uses a JWT-based authentication system with the following components:

- **Backend**: Spring Boot authentication service with JWT tokens
- **Frontend**: React/Next.js with authentication context and forms
- **Database**: PostgreSQL for user storage
- **Security**: Spring Security with role-based access control

## Backend Authentication Service

### Endpoints

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/authenticate` - User login
- `POST /api/v1/auth/validate` - Token validation
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user info
- `GET /api/v1/auth/roles` - Get available roles (Admin only)

### User Roles

- **ADMIN**: Full system access
- **SUPERVISEUR**: Flight operations and staff management
- **AGENT**: Basic flight and staff information access

### Data Models

#### RegisterRequest
```json
{
  "firstName": "string",
  "lastName": "string", 
  "email": "string",
  "password": "string",
  "role": "ADMIN|SUPERVISEUR|AGENT"
}
```

#### AuthenticationRequest
```json
{
  "email": "string",
  "password": "string"
}
```

#### AuthenticationResponse
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "ADMIN|SUPERVISEUR|AGENT"
  }
}
```

## Frontend Authentication

### Components

- `LoginForm` - User login interface
- `RegisterForm` - User registration interface
- `AuthContext` - Authentication state management
- `ProtectedRoute` - Route protection based on authentication

### Authentication Flow

1. User enters credentials in login/register form
2. Frontend sends request to backend authentication endpoint
3. Backend validates credentials and returns JWT token + user data
4. Frontend stores token in localStorage and updates auth context
5. User is redirected to appropriate dashboard based on role
6. Token is included in subsequent API requests

## Testing the Authentication

### 1. Start the Services

Make sure all services are running:

```bash
# Start the entire stack
docker-compose up -d

# Or start individual services
cd services/auth-service && mvn spring-boot:run
cd airops-frontend && npm run dev
```

### 2. Test Backend Endpoints

Use the provided `test-auth-endpoints.http` file or test manually:

#### Test Registration
```bash
curl -X POST http://localhost:8222/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@test.com",
    "password": "password123",
    "role": "AGENT"
  }'
```

#### Test Login
```bash
curl -X POST http://localhost:8222/api/v1/auth/authenticate \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@test.com",
    "password": "password123"
  }'
```

### 3. Test Frontend Authentication

1. Navigate to `http://localhost:3000`
2. Click "Test Authentication" button or go to `/test-auth`
3. Use the test page to:
   - Test user registration
   - Test user login
   - Test token validation
   - Test logout functionality

### 4. Test Protected Routes

1. Login with valid credentials
2. Navigate to different dashboard sections
3. Verify role-based access control works
4. Test logout and verify protected routes are inaccessible

## Configuration

### Backend Configuration

The authentication service is configured via:
- `application.yml` - Basic Spring configuration
- `SecurityConfiguration.java` - Security and CORS settings
- `ApplicationConfig.java` - Authentication provider configuration

### Frontend Configuration

Authentication endpoints are configured in:
- `contexts/auth-context.tsx` - API endpoint URLs
- `components/auth/*.tsx` - Form validation and submission

## Security Features

- **JWT Tokens**: Secure, stateless authentication
- **Password Encryption**: BCrypt password hashing
- **Role-Based Access Control**: Granular permissions per role
- **CORS Configuration**: Secure cross-origin requests
- **Token Validation**: Automatic token verification on protected endpoints

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS configuration allows frontend domain
2. **Token Validation Failures**: Check JWT secret configuration and token expiration
3. **Database Connection**: Verify PostgreSQL is running and accessible
4. **Port Conflicts**: Ensure ports 8222 (gateway) and 3000 (frontend) are available

### Debug Steps

1. Check backend logs for authentication errors
2. Verify frontend network requests in browser dev tools
3. Test backend endpoints directly with curl/Postman
4. Check database for user records and token storage

## Next Steps

- Implement password reset functionality
- Add email verification for new registrations
- Implement refresh token mechanism
- Add audit logging for authentication events
- Implement rate limiting for authentication endpoints
