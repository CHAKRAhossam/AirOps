# Flight Service

A Spring Boot microservice for managing flights in the AirOps airport management platform.

## Features

- **Flight Management**: CRUD operations for flights
- **Status Management**: Track flight statuses (Scheduled, Boarding, Delayed, Cancelled, Landed, Departed, Arrived)
- **Role-Based Access Control**: Uses auth-service roles (ADMIN, SUPERVISEUR, AGENT)
- **JWT Authentication**: Validates tokens with auth-service
- **PostgreSQL Database**: Persistent storage for flight data

## Role-Based Access Control

| Operation | ADMIN | SUPERVISEUR | AGENT |
|-----------|-------|-------------|-------|
| Create Flight | ✅ | ✅ | ❌ |
| Update Flight | ✅ | ✅ | ❌ |
| Delete Flight | ✅ | ❌ | ❌ |
| Read Flights | ✅ | ✅ | ✅ |
| Update Status | ✅ | ✅ | ❌ |

## API Endpoints

### Public Endpoints (No Authentication Required)
- `GET /api/v1/flights/statuses` - Get all flight statuses

### Protected Endpoints (Authentication Required)

#### Flight Management
- `GET /api/v1/flights` - Get all flights
- `GET /api/v1/flights/{id}` - Get flight by ID
- `POST /api/v1/flights` - Create a new flight
- `PUT /api/v1/flights/{id}` - Update a flight
- `DELETE /api/v1/flights/{id}` - Delete a flight

#### Status Management
- `PUT /api/v1/flights/{id}/status` - Update flight status

#### Query Endpoints
- `GET /api/v1/flights/status/{status}` - Get flights by status
- `GET /api/v1/flights/airline/{airline}` - Get flights by airline

## Flight Entity

```json
{
  "id": 1,
  "flightNumber": "AF123",
  "airline": "Air France",
  "origin": "Paris CDG",
  "destination": "New York JFK",
  "departureTime": "2024-01-15T10:00:00",
  "arrivalTime": "2024-01-15T13:30:00",
  "gate": "A12",
  "status": "SCHEDULED",
  "aircraftType": "Boeing 777",
  "pilotId": "PILOT001",
  "coPilotId": "PILOT002",
  "crewMembers": "5",
  "passengerCount": 280,
  "notes": "Regular scheduled flight",
  "createdAt": "2024-01-15T09:00:00",
  "updatedAt": "2024-01-15T09:00:00"
}
```

## Flight Statuses

- `SCHEDULED` - Flight is scheduled
- `BOARDING` - Passengers are boarding
- `DELAYED` - Flight is delayed
- `CANCELLED` - Flight is cancelled
- `LANDED` - Flight has landed
- `DEPARTED` - Flight has departed
- `ARRIVED` - Flight has arrived at destination

## Configuration

### Environment Variables
- `DB_USERNAME` - Database username (default: postgres)
- `DB_PASSWORD` - Database password (default: postgres)
- `AUTH_SERVICE_URL` - Auth service URL (default: http://auth-service:8090)
- `EUREKA_SERVER` - Eureka server URL (default: http://discovery-service:8761)

### Database
- **Database**: PostgreSQL
- **Port**: 5434 (external), 5432 (internal)
- **Database Name**: airops_flights

## Running the Service

### Using Docker Compose
```bash
docker-compose up flight-service
```

### Using Maven
```bash
cd services/flight-service
mvn spring-boot:run
```

## Testing

### Test Script
Run the test script to verify the service:
```bash
.\test-flight-service.ps1
```

### Manual Testing with Postman

1. **Register/Login** with auth-service to get a JWT token
2. **Set Authorization header**: `Bearer <your-token>`
3. **Test endpoints**:
   - `GET http://localhost:8084/api/v1/flights/statuses` (public)
   - `GET http://localhost:8084/api/v1/flights` (protected)
   - `POST http://localhost:8084/api/v1/flights` (protected)

## Dependencies

- **Spring Boot 3.2.0**
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Database operations
- **Spring Cloud OpenFeign** - HTTP client for auth-service
- **Spring Cloud Netflix Eureka** - Service discovery
- **PostgreSQL** - Database
- **JWT** - Token validation
- **Lombok** - Reduce boilerplate code

## Architecture

The flight service follows the same pattern as other AirOps services:

1. **Controller Layer** - REST API endpoints
2. **Service Layer** - Business logic
3. **Repository Layer** - Data access
4. **Entity Layer** - Database models
5. **DTO Layer** - Data transfer objects
6. **Config Layer** - Security and configuration
7. **Client Layer** - External service communication

## Security

- JWT token validation with auth-service
- Role-based access control
- CSRF protection disabled (stateless API)
- Public endpoints for status information
- Protected endpoints for flight management 