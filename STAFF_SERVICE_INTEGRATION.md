# 🧑‍✈️ Staff Service Frontend Integration

## Overview
This document describes the complete integration between the AirOps frontend and the Staff Service backend, enabling full CRUD operations for staff management.

## 🏗️ Architecture

### Backend Services
- **Staff Service**: Spring Boot microservice (Port 8083)
- **API Gateway**: Spring Cloud Gateway (Port 8222)
- **Service Discovery**: Eureka (Port 8761)
- **Configuration**: Spring Cloud Config Server (Port 8888)
- **Database**: PostgreSQL (airops_staff)

### Frontend
- **Framework**: Next.js 15 with TypeScript
- **UI Components**: Shadcn/ui components
- **State Management**: React hooks and context
- **API Client**: Custom service layer with fetch API

## 🔌 API Integration

### Base URL
All staff service requests go through the API Gateway:
```
http://localhost:8222/api/v1/staff
```

### Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| `GET` | `/` | Get all staff (paginated) | Required |
| `GET` | `/{id}` | Get staff by ID | Required |
| `POST` | `/` | Create new staff member | Required |
| `PUT` | `/{id}` | Update staff member | Required |
| `DELETE` | `/{id}` | Delete staff member | Required |
| `GET` | `/role/{role}` | Get staff by role | Required |
| `GET` | `/status/{status}` | Get staff by status | Required |
| `GET` | `/hire-date` | Get staff by hire date range | Required |
| `GET` | `/roles` | Get all available roles | Required |
| `GET` | `/statuses` | Get all available statuses | Required |
| `GET` | `/departments` | Get all available departments | Required |

## 📁 Frontend Components

### 1. Staff Service API Client (`/lib/staff-service.ts`)
- **Purpose**: Centralized API communication layer
- **Features**:
  - Type-safe interfaces for all data models
  - Error handling and response validation
  - Automatic request/response transformation
  - Gateway routing integration

### 2. Staff List Component (`/components/staff/staff-list.tsx`)
- **Purpose**: Display and manage staff members
- **Features**:
  - Real-time data loading from API
  - Search and filtering capabilities
  - Pagination support
  - CRUD operations integration
  - Loading states and error handling

### 3. Staff Form Component (`/components/staff/staff-form.tsx`)
- **Purpose**: Create and edit staff members
- **Features**:
  - Form validation with real-time feedback
  - Dynamic dropdowns for roles, departments, and statuses
  - Date picker for hire dates
  - Create/Update mode switching
  - API integration for form submission

### 4. Staff Details Component (`/components/staff/staff-details.tsx`)
- **Purpose**: View detailed staff information
- **Features**:
  - Comprehensive staff profile display
  - Formatted data presentation
  - Quick action buttons
  - Responsive design

### 5. Staff Page (`/app/staff/page.tsx`)
- **Purpose**: Main staff management page
- **Features**:
  - View state management
  - Component orchestration
  - Error handling and user feedback
  - Authentication protection

## 🔄 Data Flow

### 1. Data Loading
```
Frontend → API Gateway → Staff Service → Database
```

### 2. Data Creation/Update
```
Frontend Form → Validation → API Gateway → Staff Service → Database
```

### 3. Data Deletion
```
Frontend Action → Confirmation → API Gateway → Staff Service → Database
```

## 📊 Data Models

### StaffMember Interface
```typescript
interface StaffMember {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  staffRole: StaffRole;
  department: Department;
  status: StaffStatus;
  hireDate: string;
  roleDisplayName: string;
  departmentDisplayName: string;
  statusDisplayName: string;
}
```

### CreateStaffRequest Interface
```typescript
interface CreateStaffRequest {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  staffRole: string;
  department: string;
  hireDate: string;
  status?: string;
}
```

## 🎯 Key Features

### ✅ **Real-time Data Management**
- Live data fetching from backend
- Automatic list refresh after operations
- Real-time search and filtering

### ✅ **Form Validation**
- Client-side validation with immediate feedback
- Server-side validation error handling
- Required field enforcement
- Format validation (email, employee ID)

### ✅ **User Experience**
- Loading states and progress indicators
- Toast notifications for success/error
- Responsive design for all screen sizes
- Intuitive navigation between views

### ✅ **Error Handling**
- Graceful error display
- Retry mechanisms
- User-friendly error messages
- Fallback UI states

## 🚀 Getting Started

### 1. Start Backend Services
```bash
cd services
docker-compose up -d
```

### 2. Start Frontend
```bash
cd airops-frontend
npm run dev
```

### 3. Access Staff Management
Navigate to: `http://localhost:3000/staff`

## 🧪 Testing

### API Testing
Use the provided `test-staff-endpoints.http` file with VS Code REST Client or similar tools.

### Frontend Testing
1. Navigate to staff page
2. Test CRUD operations
3. Verify form validation
4. Check error handling
5. Test responsive design

## 🔧 Configuration

### Environment Variables
- **Gateway URL**: `http://localhost:8222`
- **Staff Service Port**: `8083`
- **Database**: `airops_staff`

### Gateway Routes
```yaml
# Staff Service Routes
- id: staff-service-main
  uri: lb://staff-service
  predicates:
    - Path=/api/v1/staff/**
  filters:
    - name: RewritePath
      args:
        regexp: /api/v1/staff/(?<segment>.*)
        replacement: /api/v1/staff/${segment}
```

## 🐛 Troubleshooting

### Common Issues

#### 1. **Staff Service Not Starting**
- Check PostgreSQL connection
- Verify Eureka registration
- Check config server connectivity

#### 2. **Frontend API Errors**
- Verify gateway is running on port 8222
- Check CORS configuration
- Verify service discovery

#### 3. **Database Connection Issues**
- Check PostgreSQL container status
- Verify database credentials
- Check network connectivity

### Debug Steps
1. Check service logs: `docker-compose logs staff-service`
2. Verify gateway routes: `http://localhost:8222/actuator/gateway/routes`
3. Check Eureka: `http://localhost:8761`
4. Test direct service: `http://localhost:8083/actuator/health`

## 📈 Future Enhancements

### Planned Features
- [ ] Bulk operations (import/export)
- [ ] Advanced filtering and sorting
- [ ] Staff performance metrics
- [ ] Document management
- [ ] Audit logging
- [ ] Real-time notifications

### Performance Optimizations
- [ ] Data caching
- [ ] Lazy loading
- [ ] Virtual scrolling for large lists
- [ ] Optimistic updates

## 🤝 Contributing

### Code Standards
- Use TypeScript for type safety
- Follow React hooks best practices
- Implement proper error boundaries
- Write comprehensive error handling
- Use consistent naming conventions

### Testing Requirements
- Unit tests for utility functions
- Integration tests for API calls
- E2E tests for user workflows
- Performance testing for large datasets

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Maintainer**: AirOps Development Team
