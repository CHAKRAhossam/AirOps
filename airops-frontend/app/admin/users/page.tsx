"use client"

import { useEffect, useState } from "react"
import adminService, { type AdminUser } from "@/lib/admin-service"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { Button } from "@/components/ui/button"
import {
  Search,
  Filter,
  Download,
  UserPlus,
  MoreVertical,
  Mail,
  Shield,
  Calendar,
  ArrowUpDown,
  RefreshCw
} from "lucide-react"

export default function AdminUsersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'role'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    if (!user) {
      router.push("/login")
    } else if (user.role !== "ADMIN") {
      router.push("/dashboard")
    }
  }, [user, router])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await adminService.getUsers()
      setUsers(data)
      setFilteredUsers(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  // Filter and search users
  useEffect(() => {
    let filtered = users

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(u =>
          `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply role filter
    if (roleFilter !== "ALL") {
      filtered = filtered.filter(u => u.role === roleFilter)
    }

    // Apply sorting
    filtered = filtered.sort((a, b) => {
      let aValue: string
      let bValue: string

      switch (sortBy) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`
          bValue = `${b.firstName} ${b.lastName}`
          break
        case 'email':
          aValue = a.email
          bValue = b.email
          break
        case 'role':
          aValue = a.role
          bValue = b.role
          break
        default:
          aValue = `${a.firstName} ${a.lastName}`
          bValue = `${b.firstName} ${b.lastName}`
      }

      const comparison = aValue.localeCompare(bValue)
      return sortOrder === 'asc' ? comparison : -comparison
    })

    setFilteredUsers(filtered)
  }, [users, searchTerm, roleFilter, sortBy, sortOrder])

  const handleSort = (column: 'name' | 'email' | 'role') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const exportUsers = () => {
    const csv = [
      ['Name', 'Email', 'Role'],
      ...filteredUsers.map(u => [`${u.firstName} ${u.lastName}`, u.email, u.role])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const uniqueRoles = Array.from(new Set(users.map(u => u.role))).sort()

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
      case 'ADMIN': return <Shield className="h-3 w-3" />
      case 'MANAGER': return <UserPlus className="h-3 w-3" />
      default: return <Mail className="h-3 w-3" />
    }
  }

  if (!user || user.role !== "ADMIN") return null

  return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-1">Manage all system users and their permissions</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                  onClick={loadUsers}
                  disabled={loading}
                  variant="outline"
                  size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={exportUsers} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>

          {uniqueRoles.map(role => (
              <div key={role} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    {getRoleIcon(role)}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{role}s</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {users.filter(u => u.role === role).length}
                    </p>
                  </div>
                </div>
              </div>
          )).slice(0, 3)}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search users by name or email..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Role Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                    className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="ALL">All Roles</option>
                  {uniqueRoles.map(role => (
                      <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {filteredUsers.length} of {users.length} users
              </p>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1 hover:text-gray-700"
                  >
                    User
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                      onClick={() => handleSort('email')}
                      className="flex items-center gap-1 hover:text-gray-700"
                  >
                    Email
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                      onClick={() => handleSort('role')}
                      className="flex items-center gap-1 hover:text-gray-700"
                  >
                    Role
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {loading && (
                  <tr>
                    <td className="px-6 py-4 text-center" colSpan={4}>
                      <div className="flex items-center justify-center">
                        <RefreshCw className="h-5 w-5 animate-spin text-gray-400 mr-2" />
                        <span className="text-gray-500">Loading users...</span>
                      </div>
                    </td>
                  </tr>
              )}

              {!loading && filteredUsers.length === 0 && (
                  <tr>
                    <td className="px-6 py-4 text-center" colSpan={4}>
                      <div className="text-gray-500">
                        {users.length === 0 ? 'No users found' : 'No users match your filters'}
                      </div>
                    </td>
                  </tr>
              )}

              {!loading && filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                            {u.firstName.charAt(0)}{u.lastName.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {u.firstName} {u.lastName}
                          </div>
                          <div className="text-sm text-gray-500">ID: {u.id.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(u.role)}`}>
                      {getRoleIcon(u.role)}
                      {u.role}
                    </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="hover:bg-blue-50">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="hover:bg-red-50 text-red-600 hover:text-red-700">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>

          {/* Pagination (placeholder) */}
          {filteredUsers.length > 0 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredUsers.length}</span> of{' '}
                    <span className="font-medium">{filteredUsers.length}</span> results
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled>
                      Previous
                    </Button>
                    <span className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded border">1</span>
                    <Button variant="outline" size="sm" disabled>
                      Next
                    </Button>
                  </div>
                </div>
              </div>
          )}
        </div>
      </div>
          </main>
        </div>
      </div>
  )
}