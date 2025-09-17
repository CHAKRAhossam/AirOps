# 🚀 AirOps Microservices - Postman Testing Guide

## 📋 Prerequisites
- Postman installed
- Docker containers running (`docker-compose up -d`)
- All services healthy

## 🔧 Setup Instructions

### 1. Import Collections and Environment
1. Open Postman
2. Click "Import" 
3. Import these files:
   - `AirOps-Complete-Testing.postman_collection.json`
   - `AirOps-Environment.postman_environment.json`

### 2. Set Up Environment
1. Select the "AirOps Environment" from the environment dropdown
2. Verify all variables are set correctly:
   - `base_url`: http://localhost
   - `auth_port`: 8090
   - `flight_port`: 8084
   - `staff_port`: 8083
   - `discovery_port`: 8761

## 🧪 Testing Sequence

### Step 1: Health Checks
Run these requests to verify all services are running:

1. **Discovery Service Health**
   - Method: GET
   - URL: `{{discovery_url}}/actuator/health`
   - Expected: 200 OK with `{"status":"UP"}`

2. **Auth Service Health**
   - Method: GET
   - URL: `{{auth_url}}/actuator/health`
   - Expected: 200 OK with `{"status":"UP"}`

3. **Flight Service Health**
   - Method: GET
   - URL: `{{flight_url}}/actuator/health`
   - Expected: 200 OK with `{"status":"UP"}`

4. **Staff Service Health**
   - Method: GET
   - URL: `{{staff_url}}/actuator/health`
   - Expected: 200 OK with `{"status":"UP"}`

### Step 2: User Registration & Authentication

#### 2.1 Register Users
Run these requests in order:

1. **Register Admin**
   - Method: POST
   - URL: `{{auth_url}}/api/v1/auth/register`
   - Body: JSON with admin details
   - Expected: 200 OK with token

2. **Register Supervisor**
   - Method: POST
   - URL: `{{auth_url}}/api/v1/auth/register`
   - Body: JSON with supervisor details
   - Expected: 200 OK with token

3. **Register Agent**
   - Method: POST
   - URL: `{{auth_url}}/api/v1/auth/register`
   - Body: JSON with agent details
   - Expected: 200 OK with token

#### 2.2 Login & Save Tokens
Run these requests and save the tokens to environment variables:

1. **Login Admin**
   - Method: POST
   - URL: `{{auth_url}}/api/v1/auth/authenticate`
   - Body: JSON with admin credentials
   - **Save the token to `admin_token` variable**

2. **Login Supervisor**
   - Method: POST
   - URL: `{{auth_url}}/api/v1/auth/authenticate`
   - Body: JSON with supervisor credentials
   - **Save the token to `supervisor_token` variable**

3. **Login Agent**
   - Method: POST
   - URL: `{{auth_url}}/api/v1/auth/authenticate`
   - Body: JSON with agent credentials
   - **Save the token to `agent_token` variable**

### Step 3: Flight Service Testing

#### 3.1 Public Endpoints (No Auth Required)
1. **Get Flight Statuses**
   - Method: GET
   - URL: `{{flight_url}}/api/v1/flights/statuses`
   - Expected: 200 OK with array of statuses

#### 3.2 Admin Operations
Test all operations with admin token:

1. **Get All Flights (Admin)**
   - Method: GET
   - URL: `{{flight_url}}/api/v1/flights`
   - Headers: `Authorization: Bearer {{admin_token}}`
   - Expected: 200 OK

2. **Create Flight (Admin)**
   - Method: POST
   - URL: `{{flight_url}}/api/v1/flights`
   - Headers: `Authorization: Bearer {{admin_token}}`
   - Body: JSON with flight details
   - Expected: 201 Created

3. **Update Flight Status (Admin)**
   - Method: PUT
   - URL: `{{flight_url}}/api/v1/flights/1/status`
   - Headers: `Authorization: Bearer {{admin_token}}`
   - Body: JSON with new status
   - Expected: 200 OK

4. **Delete Flight (Admin)**
   - Method: DELETE
   - URL: `{{flight_url}}/api/v1/flights/1`
   - Headers: `Authorization: Bearer {{admin_token}}`
   - Expected: 200 OK

5. **Get Flight by ID (Admin)**
   - Method: GET
   - URL: `{{flight_url}}/api/v1/flights/1`
   - Headers: `Authorization: Bearer {{admin_token}}`
   - Expected: 200 OK

6. **Get Flights by Status (Admin)**
   - Method: GET
   - URL: `{{flight_url}}/api/v1/flights/status/SCHEDULED`
   - Headers: `Authorization: Bearer {{admin_token}}`
   - Expected: 200 OK

7. **Get Flights by Airline (Admin)**
   - Method: GET
   - URL: `{{flight_url}}/api/v1/flights/airline/Air%20France`
   - Headers: `Authorization: Bearer {{admin_token}}`
   - Expected: 200 OK

#### 3.3 Supervisor Operations
Test operations with supervisor token:

1. **Get All Flights (Supervisor)**
   - Method: GET
   - URL: `{{flight_url}}/api/v1/flights`
   - Headers: `Authorization: Bearer {{supervisor_token}}`
   - Expected: 200 OK

2. **Create Flight (Supervisor)**
   - Method: POST
   - URL: `{{flight_url}}/api/v1/flights`
   - Headers: `Authorization: Bearer {{supervisor_token}}`
   - Body: JSON with flight details
   - Expected: 201 Created

3. **Update Flight Status (Supervisor)**
   - Method: PUT
   - URL: `{{flight_url}}/api/v1/flights/2/status`
   - Headers: `Authorization: Bearer {{supervisor_token}}`
   - Body: JSON with new status
   - Expected: 200 OK

4. **Delete Flight (Supervisor) - Should Fail**
   - Method: DELETE
   - URL: `{{flight_url}}/api/v1/flights/2`
   - Headers: `Authorization: Bearer {{supervisor_token}}`
   - Expected: 403 Forbidden

#### 3.4 Agent Operations
Test operations with agent token:

1. **Get All Flights (Agent)**
   - Method: GET
   - URL: `{{flight_url}}/api/v1/flights`
   - Headers: `Authorization: Bearer {{agent_token}}`
   - Expected: 200 OK

2. **Create Flight (Agent) - Should Fail**
   - Method: POST
   - URL: `{{flight_url}}/api/v1/flights`
   - Headers: `Authorization: Bearer {{agent_token}}`
   - Body: JSON with flight details
   - Expected: 403 Forbidden

3. **Update Flight Status (Agent) - Should Fail**
   - Method: PUT
   - URL: `{{flight_url}}/api/v1/flights/1/status`
   - Headers: `Authorization: Bearer {{agent_token}}`
   - Body: JSON with new status
   - Expected: 403 Forbidden

4. **Delete Flight (Agent) - Should Fail**
   - Method: DELETE
   - URL: `{{flight_url}}/api/v1/flights/1`
   - Headers: `Authorization: Bearer {{agent_token}}`
   - Expected: 403 Forbidden

### Step 4: Staff Service Testing

#### 4.1 Public Endpoints (No Auth Required)
1. **Get Staff Roles**
   - Method: GET
   - URL: `{{staff_url}}/api/v1/staff/roles`
   - Expected: 200 OK with array of roles

2. **Get Staff Statuses**
   - Method: GET
   - URL: `{{staff_url}}/api/v1/staff/statuses`
   - Expected: 200 OK with array of statuses

#### 4.2 Admin Operations
Test all operations with admin token:

1. **Get All Staff (Admin)**
   - Method: GET
   - URL: `{{staff_url}}/api/v1/staff`
   - Headers: `Authorization: Bearer {{admin_token}}`
   - Expected: 200 OK

2. **Create Staff (Admin)**
   - Method: POST
   - URL: `{{staff_url}}/api/v1/staff`
   - Headers: `Authorization: Bearer {{admin_token}}`
   - Body: JSON with staff details
   - Expected: 201 Created

3. **Update Staff (Admin)**
   - Method: PUT
   - URL: `{{staff_url}}/api/v1/staff/1`
   - Headers: `Authorization: Bearer {{admin_token}}`
   - Body: JSON with updated staff details
   - Expected: 200 OK

4. **Delete Staff (Admin)**
   - Method: DELETE
   - URL: `{{staff_url}}/api/v1/staff/1`
   - Headers: `Authorization: Bearer {{admin_token}}`
   - Expected: 204 No Content

5. **Get Staff by ID (Admin)**
   - Method: GET
   - URL: `{{staff_url}}/api/v1/staff/1`
   - Headers: `Authorization: Bearer {{admin_token}}`
   - Expected: 200 OK

6. **Search Staff (Admin)**
   - Method: GET
   - URL: `{{staff_url}}/api/v1/staff/search?searchTerm=Jean`
   - Headers: `Authorization: Bearer {{admin_token}}`
   - Expected: 200 OK

7. **Get Staff by Role (Admin)**
   - Method: GET
   - URL: `{{staff_url}}/api/v1/staff/role/PILOT`
   - Headers: `Authorization: Bearer {{admin_token}}`
   - Expected: 200 OK

8. **Get Staff by Status (Admin)**
   - Method: GET
   - URL: `{{staff_url}}/api/v1/staff/status/ACTIVE`
   - Headers: `Authorization: Bearer {{admin_token}}`
   - Expected: 200 OK

#### 4.3 Supervisor Operations
Test operations with supervisor token:

1. **Get All Staff (Supervisor)**
   - Method: GET
   - URL: `{{staff_url}}/api/v1/staff`
   - Headers: `Authorization: Bearer {{supervisor_token}}`
   - Expected: 200 OK

2. **Create Staff (Supervisor)**
   - Method: POST
   - URL: `{{staff_url}}/api/v1/staff`
   - Headers: `Authorization: Bearer {{supervisor_token}}`
   - Body: JSON with staff details
   - Expected: 201 Created

3. **Update Staff (Supervisor)**
   - Method: PUT
   - URL: `{{staff_url}}/api/v1/staff/2`
   - Headers: `Authorization: Bearer {{supervisor_token}}`
   - Body: JSON with updated staff details
   - Expected: 200 OK

4. **Delete Staff (Supervisor) - Should Fail**
   - Method: DELETE
   - URL: `{{staff_url}}/api/v1/staff/2`
   - Headers: `Authorization: Bearer {{supervisor_token}}`
   - Expected: 403 Forbidden

#### 4.4 Agent Operations
Test operations with agent token:

1. **Get All Staff (Agent)**
   - Method: GET
   - URL: `{{staff_url}}/api/v1/staff`
   - Headers: `Authorization: Bearer {{agent_token}}`
   - Expected: 200 OK

2. **Create Staff (Agent) - Should Fail**
   - Method: POST
   - URL: `{{staff_url}}/api/v1/staff`
   - Headers: `Authorization: Bearer {{agent_token}}`
   - Body: JSON with staff details
   - Expected: 403 Forbidden

3. **Update Staff (Agent) - Should Fail**
   - Method: PUT
   - URL: `{{staff_url}}/api/v1/staff/1`
   - Headers: `Authorization: Bearer {{agent_token}}`
   - Body: JSON with updated staff details
   - Expected: 403 Forbidden

4. **Delete Staff (Agent) - Should Fail**
   - Method: DELETE
   - URL: `{{staff_url}}/api/v1/staff/1`
   - Headers: `Authorization: Bearer {{agent_token}}`
   - Expected: 403 Forbidden

### Step 5: Debug Endpoints

#### 5.1 Flight Service Debug
1. **Flight Debug Auth (Admin)**
   - Method: GET
   - URL: `{{flight_url}}/api/v1/flights/debug/auth`
   - Headers: `Authorization: Bearer {{admin_token}}`
   - Expected: 200 OK with authentication details

#### 5.2 Staff Service Debug
1. **Staff Debug Auth (Admin)**
   - Method: GET
   - URL: `{{staff_url}}/api/v1/staff/debug/auth`
   - Headers: `Authorization: Bearer {{admin_token}}`
   - Expected: 200 OK with authentication details

## 🎯 Expected Results

### ✅ Success Responses
- **200 OK**: Successful GET operations
- **201 Created**: Successful POST operations
- **204 No Content**: Successful DELETE operations

### ❌ Expected Failures
- **403 Forbidden**: Unauthorized operations (correct behavior)
- **401 Unauthorized**: Missing or invalid token
- **404 Not Found**: Resource not found

## 🔍 Testing Checklist

- [ ] All services are healthy
- [ ] User registration works
- [ ] User authentication works
- [ ] Token generation works
- [ ] Public endpoints are accessible
- [ ] Protected endpoints require authentication
- [ ] Admin has full CRUD access
- [ ] Supervisor has CREATE/UPDATE/READ access
- [ ] Agent has READ-only access
- [ ] Unauthorized operations return 403
- [ ] Debug endpoints show correct authorities

## 🚨 Troubleshooting

### Common Issues:
1. **403 Forbidden**: Check if token is valid and has correct authorities
2. **401 Unauthorized**: Check if Authorization header is set correctly
3. **Connection refused**: Check if services are running
4. **500 Internal Server Error**: Check service logs

### Debug Steps:
1. Check service health endpoints
2. Verify token format: `Bearer <token>`
3. Test with different roles
4. Check debug endpoints for authority information
5. Review service logs for errors

## 📊 Testing Summary

After completing all tests, you should have verified:
- ✅ Authentication and authorization work correctly
- ✅ Role-based access control is enforced
- ✅ CRUD operations work as expected
- ✅ Security is properly implemented
- ✅ All endpoints are functional

## 🎉 Quick Start

1. **Import the collection and environment**
2. **Run health checks** to verify services are up
3. **Register and login users** to get tokens
4. **Test admin operations** (should all succeed)
5. **Test supervisor operations** (CREATE/UPDATE/READ should succeed, DELETE should fail)
6. **Test agent operations** (only READ should succeed)
7. **Use debug endpoints** to verify authorities

## 📝 Notes

- Tokens are automatically saved to environment variables
- All URLs use environment variables for easy configuration
- The collection is organized by service and role for easy testing
- Debug endpoints help verify that authorities are working correctly
