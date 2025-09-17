"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Calendar, Mail, User, Building, Shield, Clock } from "lucide-react"
import { StaffMember } from "@/lib/staff-service"

interface StaffDetailsProps {
  staff: StaffMember
  onEdit: () => void
  onClose: () => void
}

export function StaffDetails({ staff, onEdit, onClose }: StaffDetailsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusBadgeVariant = (statusId: string) => {
    switch (statusId) {
      case "ACTIVE":
        return "default"
      case "ON_LEAVE":
        return "secondary"
      case "INACTIVE":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Staff List
        </Button>
        <Button onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Staff
        </Button>
      </div>

      {/* Staff Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-lg">
                {staff.firstName.charAt(0)}{staff.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">
                {staff.firstName} {staff.lastName}
              </CardTitle>
              <p className="text-gray-600">{staff.employeeId}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="secondary">
                  {staff.roleDisplayName || staff.staffRole.displayName}
                </Badge>
                <Badge variant={getStatusBadgeVariant(staff.status.id)}>
                  {staff.statusDisplayName || staff.status.displayName}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Staff Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{staff.email}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Hire Date</p>
                <p className="font-medium">{formatDate(staff.hireDate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Employment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="font-medium">{staff.roleDisplayName || staff.staffRole.displayName}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center space-x-3">
              <Building className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="font-medium">{staff.departmentDisplayName || staff.department.displayName}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center space-x-3">
              <Clock className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge variant={getStatusBadgeVariant(staff.status.id)}>
                  {staff.statusDisplayName || staff.status.displayName}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {staff.employeeId}
              </p>
              <p className="text-sm text-gray-600">Employee ID</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {staff.staffRole.id}
              </p>
              <p className="text-sm text-gray-600">Role Code</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {staff.department.id}
              </p>
              <p className="text-sm text-gray-600">Department Code</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-center space-x-4">
        <Button variant="outline" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>
        <Button onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Staff Member
        </Button>
      </div>
    </div>
  )
}
