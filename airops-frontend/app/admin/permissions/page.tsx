"use client"

import { useEffect, useState } from "react"
import adminService, { type AdminUser } from "@/lib/admin-service"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { Button } from "@/components/ui/button"
import {
  Shield,
  Users,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Mail,
  Crown,
  Key,
  ChevronDown,
  Save,
  UserCheck
} from "lucide-react"

export default function AdminPermissionsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [roles, setRoles] = useState<string[]>([])
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [authorities, setAuthorities] = useState<string[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")

  useEffect(() => {
    if (!user) {
      router.push("/login")
    } else if (user.role !== "ADMIN") {
      router.push("/dashboard")
    }
  }, [user, router])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [rs, us] = await Promise.all([
        adminService.getRoles(),
        adminService.getUsers(),
      ])
      setRoles(rs)
      setUsers(us)
      const initial = rs[0] ?? ""
      setSelectedRole(initial)
      if (initial) {
        const auths = await adminService.getAuthoritiesForRole(initial)
        setAuthorities(auths)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  // Filter users based on search and role filter
  useEffect(() => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(u =>
          `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (roleFilter !== "ALL") {
      filtered = filtered.filter(u => u.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, roleFilter])

  const onSelectRole = async (role: string) => {
    setSelectedRole(role)
    setAuthorities([])
    try {
      const auths = await adminService.getAuthoritiesForRole(role)
      setAuthorities(auths)
    } catch {
      setAuthorities([])
    }
  }

  const onChangeUserRole = async (u: AdminUser, role: string) => {
    setSaving(u.id)
    try {
      const updated = await adminService.updateUserRole(u.id, role)
      setUsers(prev => prev.map(x => x.id === u.id ? updated : x))
    } finally {
      setSaving(null)
    }
  }

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'ADMIN': 'bg-red-100 text-red-800 border-red-200',
      'MANAGER': 'bg-blue-100 text-blue-800 border-blue-200',
      'STAFF': 'bg-green-100 text-green-800 border-green-200',
      'USER': 'bg-gray-100 text-gray-800 border-gray-200',
    }
    return colors[role] || 'bg-purple-100 text-purple-800 border-purple-200'
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return <Shield className="h-4 w-4" />
      case 'MANAGER': return <Crown className="h-4 w-4" />
      case 'STAFF': return <UserCheck className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  const getAuthorityCategory = (authority: string) => {
    if (authority.includes('user') || authority.includes('USER')) return 'User Management'
    if (authority.includes('flight') || authority.includes('FLIGHT')) return 'Flight Operations'
    if (authority.includes('report') || authority.includes('REPORT')) return 'Reports'
    if (authority.includes('admin') || authority.includes('ADMIN')) return 'Administration'
    if (authority.includes('staff') || authority.includes('STAFF')) return 'Staff Management'
    return 'General'
  }

  const groupedAuthorities = authorities.reduce((groups, authority) => {
    const category = getAuthorityCategory(authority)
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(authority)
    return groups
  }, {} as Record<string, string[]>)

  if (!user || user.role !== "ADMIN") return null

  return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Role & Permissions Management</h1>
                  <p className="text-gray-600 mt-1">View role authorities and manage user permissions</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                      onClick={loadAll}
                      disabled={loading}
                      variant="outline"
                      size="sm"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Roles</p>
                      <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Key className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Authorities</p>
                      <p className="text-2xl font-bold text-gray-900">{authorities.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <Settings className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Categories</p>
                      <p className="text-2xl font-bold text-gray-900">{Object.keys(groupedAuthorities).length}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Role Authorities */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <h2 className="text-xl font-semibold text-gray-900">Role Authorities</h2>
                      <div className="relative">
                        <select
                            value={selectedRole}
                            onChange={(e) => onSelectRole(e.target.value)}
                            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {roles.map(r => (
                              <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    {loading && (
                        <div className="flex items-center justify-center py-8">
                          <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                          <span className="ml-2 text-gray-500">Loading authorities...</span>
                        </div>
                    )}

                    {!loading && authorities.length === 0 && (
                        <div className="flex items-center justify-center py-8 text-gray-500">
                          <AlertTriangle className="h-6 w-6 mr-2" />
                          No authorities found for this role
                        </div>
                    )}

                    {!loading && Object.keys(groupedAuthorities).length > 0 && (
                        <div className="space-y-6">
                          {Object.entries(groupedAuthorities).map(([category, auths]) => (
                              <div key={category}>
                                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                  <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                                  {category}
                                </h3>
                                <div className="grid grid-cols-1 gap-2">
                                  {auths.map(authority => (
                                      <div key={authority} className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <CheckCircle className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                                        <span className="text-sm font-medium text-green-800">{authority}</span>
                                      </div>
                                  ))}
                                </div>
                              </div>
                          ))}
                        </div>
                    )}
                  </div>
                </div>

                {/* Users & Roles */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">User Role Management</h2>

                    {/* Search and Filter */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                            className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                          <option value="ALL">All Roles</option>
                          {roles.map(role => (
                              <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="text-sm text-gray-600 mb-4">
                      Showing {filteredUsers.length} of {users.length} users
                    </div>

                    <div className="overflow-x-auto">
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {filteredUsers.map(u => (
                            <div key={u.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                              <div className="flex items-center flex-1 min-w-0">
                                <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                                  {u.firstName.charAt(0)}{u.lastName.charAt(0)}
                                </div>
                                <div className="ml-3 min-w-0 flex-1">
                                  <div className="text-sm font-medium text-gray-900 truncate">
                                    {u.firstName} {u.lastName}
                                  </div>
                                  <div className="flex items-center text-xs text-gray-500">
                                    <Mail className="h-3 w-3 mr-1" />
                                    <span className="truncate">{u.email}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 flex-shrink-0">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(u.role)}`}>
                              {getRoleIcon(u.role)}
                              {u.role}
                            </span>

                                <div className="flex items-center gap-2">
                                  <select
                                      value={u.role}
                                      onChange={(e) => onChangeUserRole(u, e.target.value)}
                                      className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      disabled={saving === u.id}
                                  >
                                    {roles.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                  </select>

                                  {saving === u.id && (
                                      <div className="flex items-center text-xs text-blue-600">
                                        <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                                        Saving...
                                      </div>
                                  )}
                                </div>
                              </div>
                            </div>
                        ))}
                      </div>
                    </div>

                    {filteredUsers.length === 0 && !loading && (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          {users.length === 0 ? 'No users found' : 'No users match your filters'}
                        </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                    <p className="text-sm text-gray-600">Manage permissions and user roles efficiently</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Role
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Bulk Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Shield className="h-4 w-4 mr-2" />
                      Security Audit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
  )
}