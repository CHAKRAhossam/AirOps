"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { staffService, CreateStaffRequest, StaffRole, Department, StaffStatus } from "@/lib/staff-service"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

interface StaffFormProps {
  staff?: any
  onSave: (data: CreateStaffRequest) => Promise<void>
  onCancel: () => void
}

export function StaffForm({ staff, onSave, onCancel }: StaffFormProps) {
  console.log("StaffForm - Rendering with staff:", staff);
  console.log("StaffForm - Staff role:", staff?.staffRole);
  console.log("StaffForm - Staff department:", staff?.department);
  console.log("StaffForm - Staff status:", staff?.status);
  console.log("StaffForm - Staff role ID:", staff?.staffRole);
  console.log("StaffForm - Staff department ID:", staff?.department);
  console.log("StaffForm - Staff status ID:", staff?.status);
  
  const [loading, setLoading] = useState(false)
  const [loadingReferenceData, setLoadingReferenceData] = useState(true)
  const [roles, setRoles] = useState<StaffRole[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [statuses, setStaffStatus] = useState<StaffStatus[]>([])
  const [formData, setFormData] = useState<CreateStaffRequest>({
    firstName: staff?.firstName || "",
    lastName: staff?.lastName || "",
    email: staff?.email || "",
    staffRole: staff?.staffRole?.id || "",
    department: staff?.department?.id || "",
    hireDate: staff?.hireDate ? new Date(staff.hireDate).toISOString().split('T')[0] : "",
    status: staff?.status?.id || "ACTIVE"
  })
  
  // Debug logging for form data changes
  useEffect(() => {
    console.log("StaffForm - Form data changed:", formData);
  }, [formData]);
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()
  const { token } = useAuth()

  // Token is now handled automatically by axios interceptor

  // Load reference data first
  useEffect(() => {
    const loadReferenceData = async () => {
      if (!token) {
        console.log("StaffForm - No token available, skipping reference data load");
        setLoadingReferenceData(false)
        return;
      }
      
      try {
        console.log("StaffForm - Loading reference data...");
        setLoadingReferenceData(true)
        const [rolesData, departmentsData, statusesData] = await Promise.all([
          staffService.getAllRoles(),
          staffService.getAllDepartments(),
          staffService.getAllStatuses()
        ])
        
        console.log("StaffForm - Reference data loaded:", {
          roles: rolesData.length,
          departments: departmentsData.length,
          statuses: statusesData.length
        });
        
        setRoles(rolesData)
        setDepartments(departmentsData)
        setStaffStatus(statusesData)
      } catch (error) {
        console.error("StaffForm - Error loading reference data:", error)
        toast({
          title: "Error",
          description: "Failed to load form options",
          variant: "destructive",
        })
      } finally {
        setLoadingReferenceData(false)
      }
    }

    loadReferenceData()
  }, [token, toast])

  // Update form data when staff prop changes (for editing) - only after reference data is loaded
  useEffect(() => {
    if (staff && roles.length > 0 && departments.length > 0 && statuses.length > 0) {
      console.log("StaffForm - Staff prop changed and reference data loaded, updating form data:", staff);
      console.log("StaffForm - Setting staffRole to:", staff.staffRole);
      console.log("StaffForm - Setting department to:", staff.department);
      console.log("StaffForm - Setting status to:", staff.status);
      
      setFormData({
        firstName: staff.firstName || "",
        lastName: staff.lastName || "",
        email: staff.email || "",
        staffRole: staff.staffRole || "",
        department: staff.department || "",
        hireDate: staff.hireDate ? new Date(staff.hireDate).toISOString().split('T')[0] : "",
        status: staff.status || "ACTIVE"
      });
    }
  }, [staff, roles, departments, statuses])

  // Also update form data when reference data finishes loading (for initial render)
  useEffect(() => {
    if (staff && roles.length > 0 && departments.length > 0 && statuses.length > 0) {
      console.log("StaffForm - Reference data finished loading, updating form data for staff:", staff);
      console.log("StaffForm - Available roles:", roles.map(r => `${r.id}:${r.displayName}`));
      console.log("StaffForm - Available departments:", departments.map(d => `${d.id}:${d.displayName}`));
      console.log("StaffForm - Available statuses:", statuses.map(s => `${s.id}:${s.displayName}`));
      
      setFormData({
        firstName: staff.firstName || "",
        lastName: staff.lastName || "",
        email: staff.email || "",
        staffRole: staff.staffRole || "",
        department: staff.department || "",
        hireDate: staff.hireDate ? new Date(staff.hireDate).toISOString().split('T')[0] : "",
        status: staff.status || "ACTIVE"
      });
    }
  }, [roles, departments, statuses, staff])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    } else if (formData.firstName.length < 2 || formData.firstName.length > 50) {
      newErrors.firstName = "First name must be between 2 and 50 characters"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    } else if (formData.lastName.length < 2 || formData.lastName.length > 50) {
      newErrors.lastName = "Last name must be between 2 and 50 characters"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.staffRole) {
      newErrors.staffRole = "Staff role is required"
    }

    if (!formData.department) {
      newErrors.department = "Department is required"
    }

    if (!formData.hireDate) {
      newErrors.hireDate = "Hire date is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      console.log("Form validation failed:", errors);
      return
    }

    console.log("Form data being submitted:", formData);
    
    setLoading(true)
    try {
      await onSave(formData)
      toast({
        title: "Success",
        description: staff ? "Staff member updated successfully" : "Staff member created successfully",
      })
    } catch (error) {
      console.error("Error saving staff member:", error);
      toast({
        title: "Error",
        description: "Failed to save staff member",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateStaffRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{staff ? "Edit Staff Member" : "Create Staff Member"}</CardTitle>
        <CardDescription>
          {staff ? "Update staff member information" : "Add a new staff member to the system"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Loading indicator for reference data */}
          {loadingReferenceData && (
            <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-blue-600 text-sm">Loading form options...</span>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              placeholder="John"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              className={errors.firstName ? "border-red-500" : ""}
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
          </div>

          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              placeholder="Smith"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              className={errors.lastName ? "border-red-500" : ""}
            />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="john.smith@airline.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="staffRole">Staff Role *</Label>
            <Select 
              value={formData.staffRole} 
              onValueChange={(value) => handleInputChange("staffRole", value)}
              disabled={loadingReferenceData || roles.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  loadingReferenceData ? "Loading roles..." : 
                  roles.length === 0 ? "No roles available" : 
                  "Select a role"
                } />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.staffRole && <p className="text-red-500 text-sm mt-1">{errors.staffRole}</p>}
          </div>

          <div>
            <Label htmlFor="department">Department *</Label>
            <Select 
              value={formData.department} 
              onValueChange={(value) => handleInputChange("department", value)}
              disabled={loadingReferenceData || departments.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  loadingReferenceData ? "Loading departments..." : 
                  departments.length === 0 ? "No departments available" : 
                  "Select a department"
                } />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
          </div>

          <div>
            <Label htmlFor="hireDate">Hire Date *</Label>
            <Input
              id="hireDate"
              type="date"
              value={formData.hireDate}
              onChange={(e) => handleInputChange("hireDate", e.target.value)}
              className={errors.hireDate ? "border-red-500" : ""}
            />
            {errors.hireDate && <p className="text-red-500 text-sm mt-1">{errors.hireDate}</p>}
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => handleInputChange("status", value)}
              disabled={loadingReferenceData || statuses.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  loadingReferenceData ? "Loading statuses..." : 
                  statuses.length === 0 ? "No statuses available" : 
                  "Select a status"
                } />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.id} value={status.id}>
                    {status.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : (staff ? "Update Staff Member" : "Create Staff Member")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
