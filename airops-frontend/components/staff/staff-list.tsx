"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Users,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  Calendar,
  Loader2,
  RefreshCw,
  Download,
  Settings,
  UserCheck,
  Clock,
  Building
} from "lucide-react"
import { staffService, StaffMember, StaffRole, Department, StaffStatus } from "@/lib/staff-service"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

interface StaffListProps {
  onCreateStaff: () => void
  onEditStaff: (staff: StaffMember) => void
  onViewStaff: (staff: StaffMember) => void
}

export function StaffList({ onCreateStaff, onEditStaff, onViewStaff }: StaffListProps) {
  const { token } = useAuth()
  const { toast } = useToast()
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [selectedStaff, setSelectedStaff] = useState<string[]>([])
  const [roles, setRoles] = useState<StaffRole[]>([])
  const [statuses, setStatuses] = useState<StaffStatus[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  // Token is now handled automatically by axios interceptor

  // Load staff data
  const loadStaff = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)
      const response = await staffService.getAllStaff(currentPage, 20)
      setStaff(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load staff')
      toast({
        title: "Error",
        description: "Failed to load staff members",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Load reference data (roles, statuses, departments)
  const loadReferenceData = async () => {
    try {
      const [rolesData, statusesData, departmentsData] = await Promise.all([
        staffService.getAllRoles(),
        staffService.getAllStatuses(),
        staffService.getAllDepartments()
      ])
      setRoles(rolesData)
      setStatuses(statusesData)
      setDepartments(departmentsData)
    } catch (err) {
      console.error('Failed to load reference data:', err)
    }
  }

  const handleRefresh = () => {
    loadStaff(true)
    toast({
      title: "Refreshing",
      description: "Loading latest staff data...",
    })
  }

  // Delete staff member
  const handleDeleteStaff = async (staffId: number) => {
    if (!confirm('Are you sure you want to delete this staff member?')) {
      return
    }

    try {
      await staffService.deleteStaff(staffId)
      toast({
        title: "Success",
        description: "Staff member deleted successfully",
      })
      loadStaff() // Reload the list
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete staff member",
        variant: "destructive",
      })
    }
  }

  // Filter staff based on search and filters
  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
        member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = selectedRole === "all" || member.staffRole.id === selectedRole
    const matchesStatus = selectedStatus === "all" || member.status.id === selectedStatus
    const matchesDepartment = selectedDepartment === "all" || member.department.id === selectedDepartment

    return matchesSearch && matchesRole && matchesStatus && matchesDepartment
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStaff(filteredStaff.map((s) => s.id.toString()))
    } else {
      setSelectedStaff([])
    }
  }

  const handleSelectStaff = (staffId: string, checked: boolean) => {
    if (checked) {
      setSelectedStaff([...selectedStaff, staffId])
    } else {
      setSelectedStaff(selectedStaff.filter((id) => id !== staffId))
    }
  }

  // Load data on component mount
  useEffect(() => {
    if (token) {
      loadStaff()
      loadReferenceData()
    }
  }, [currentPage, token])

  if (loading && staff.length === 0) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900">Loading staff members...</p>
            <p className="text-sm text-gray-500">Please wait while we fetch your staff data</p>
          </div>
        </div>
    )
  }

  if (error) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
              <div className="text-red-600 mb-2">
                <svg className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-red-800 font-medium mb-1">Error loading staff</p>
              <p className="text-red-600 text-sm mb-4">{error}</p>
              <Button onClick={() => loadStaff()} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
    )
  }

  return (
      <div className="space-y-6">
        {/* Header with Stats */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
              <p className="text-gray-600 mt-1">Manage employee information and assignments</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-blue-600 text-sm font-medium">Total Staff</div>
              <div className="text-2xl font-bold text-blue-900">{totalElements}</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-green-600 text-sm font-medium">Active</div>
              <div className="text-2xl font-bold text-green-900">
                {staff.filter(s => s.status.id === 'ACTIVE').length}
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="text-orange-600 text-sm font-medium">On Leave</div>
              <div className="text-2xl font-bold text-orange-900">
                {staff.filter(s => s.status.id === 'ON_LEAVE').length}
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="text-purple-600 text-sm font-medium">Departments</div>
              <div className="text-2xl font-bold text-purple-900">{departments.length}</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Search staff..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10"
                    autoComplete="off"
                />
              </div>

              <Select value={selectedRole} onValueChange={setSelectedRole} disabled={roles.length === 0}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.displayName}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus} disabled={statuses.length === 0}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map((status) => (
                      <SelectItem key={status.id} value={status.id}>
                        {status.displayName}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDepartment} onValueChange={setSelectedDepartment} disabled={departments.length === 0}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.displayName}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center justify-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600 font-medium">
                {filteredStaff.length} of {totalElements} staff
              </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedStaff.length > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {selectedStaff.length}
                    </div>
                    <span className="text-sm text-blue-800 font-medium">
                  staff member{selectedStaff.length > 1 ? "s" : ""} selected
                </span>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                      <UserCheck className="h-4 w-4 mr-1" />
                      Update Status
                    </Button>
                    <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                      <Building className="h-4 w-4 mr-1" />
                      Assign Department
                    </Button>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove Staff
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
        )}

        {/* Staff Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Staff Members ({filteredStaff.length})
              </CardTitle>
              <Button onClick={onCreateStaff}>
                <Plus className="h-4 w-4 mr-2" />
                Add Staff
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-12">
                      <Checkbox
                          checked={selectedStaff.length === filteredStaff.length && filteredStaff.length > 0}
                          onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="font-semibold">Employee</TableHead>
                    <TableHead className="font-semibold">Role</TableHead>
                    <TableHead className="font-semibold">Department</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Hire Date</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <div className="text-gray-500">
                            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium mb-2">No staff members found</p>
                            <p className="text-sm">Try adjusting your search or filter criteria</p>
                          </div>
                        </TableCell>
                      </TableRow>
                  ) : (
                      filteredStaff.map((member) => (
                          <TableRow key={member.id} className="hover:bg-gray-50 transition-colors">
                            <TableCell>
                              <Checkbox
                                  checked={selectedStaff.includes(member.id.toString())}
                                  onCheckedChange={(checked) => handleSelectStaff(member.id.toString(), checked as boolean)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                                    {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-semibold text-gray-900">
                                    {member.firstName} {member.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500 font-medium">
                                    {member.employeeId}
                                  </div>
                                  <div className="text-sm text-gray-500 flex items-center">
                                    <Mail className="h-3 w-3 mr-1" />
                                    {member.email}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="font-medium">
                                {member.roleDisplayName || member.staffRole.displayName}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Building className="h-3 w-3 text-gray-400" />
                                <Badge variant="outline" className="font-medium">
                                  {member.departmentDisplayName || member.department.displayName}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                  variant={
                                    member.status.id === 'ACTIVE' ? 'default' :
                                        member.status.id === 'ON_LEAVE' ? 'secondary' :
                                            member.status.id === 'INACTIVE' ? 'destructive' : 'outline'
                                  }
                                  className="font-medium"
                              >
                                {member.statusDisplayName || member.status.displayName}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">{new Date(member.hireDate).toLocaleDateString()}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 hover:bg-gray-100"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem onClick={() => onViewStaff(member)}>
                                    <Eye className="h-4 w-4 mr-2 text-blue-600" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => onEditStaff(member)}>
                                    <Edit className="h-4 w-4 mr-2 text-green-600" />
                                    Edit Staff
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                      onClick={() => handleDeleteStaff(member.id)}
                                      className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Staff
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between p-6 border-t bg-gray-50">
                  <div className="text-sm text-gray-700">
                    Showing {currentPage * 20 + 1} to {Math.min((currentPage + 1) * 20, totalElements)} of {totalElements} results
                  </div>
                  <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0}
                    >
                      Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                        disabled={currentPage === totalPages - 1}
                    >
                      Next
                    </Button>
                  </div>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
  )
}