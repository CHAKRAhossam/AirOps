"use client"

import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "@/components/layout/sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Users,
  Database,
  Activity,
  Key,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Server,
  Zap,
  BarChart3,
  Settings
} from "lucide-react"
import adminService from "@/lib/admin-service"

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [usersCount, setUsersCount] = useState<number | null>(null)
  const [health, setHealth] = useState<{ name: string; status: string }[]>([])
  const [systemLoad, setSystemLoad] = useState<number | null>(null)
  const [apiCalls, setApiCalls] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    if (!user) {
      router.push("/login")
    } else if (user.role !== "ADMIN") {
      router.push("/dashboard")
    }
  }, [user, router])

  const loadData = async () => {
    setLoading(true)
    try {
      const [count, svc, load, calls] = await Promise.all([
        adminService.getUsersCount().catch(() => null),
        adminService.getServiceHealth().catch(() => []),
        adminService.getSystemLoad().catch(() => null),
        adminService.getApiCalls().catch(() => null),
      ])
      setUsersCount(count)
      setHealth(svc)
      setSystemLoad(load)
      setApiCalls(calls)
      setLastUpdated(new Date())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (!user || user.role !== "ADMIN") {
    return null
  }

  const healthyServices = health.filter(h => h.status === 'UP').length
  const totalServices = health.length
  const systemHealthPercentage = totalServices > 0 ? Math.round((healthyServices / totalServices) * 100) : 0

  const getSystemLoadColor = (load: number | null) => {
    if (load === null) return 'text-gray-500'
    if (load < 0.5) return 'text-green-600'
    if (load < 0.8) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSystemLoadBg = (load: number | null) => {
    if (load === null) return 'bg-gray-100'
    if (load < 0.5) return 'bg-green-50'
    if (load < 0.8) return 'bg-yellow-50'
    return 'bg-red-50'
  }

  return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Enhanced Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">System Administration</h1>
                  <p className="text-gray-600 mt-1">Monitor and manage your system resources</p>
                </div>
                <div className="flex items-center gap-3">
                  {lastUpdated && (
                      <span className="text-sm text-gray-500">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                  )}
                  <Button
                      onClick={loadData}
                      disabled={loading}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
              </Button>
                </div>
            </div>

              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Users */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {usersCount ?? (loading ? '—' : 'N/A')}
                      </p>
                      <div className="flex items-center mt-2">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600">+12% from last month</span>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-full">
                  <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>
              
                {/* System Health */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">System Health</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{systemHealthPercentage}%</p>
                      <div className="flex items-center mt-2">
                      <span className="text-sm text-gray-600">
                        {healthyServices}/{totalServices} services up
                      </span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-full ${systemHealthPercentage >= 80 ? 'bg-green-50' : systemHealthPercentage >= 50 ? 'bg-yellow-50' : 'bg-red-50'}`}>
                      <Database className={`h-8 w-8 ${systemHealthPercentage >= 80 ? 'text-green-600' : systemHealthPercentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`} />
                  </div>
                </div>
              </div>
              
                {/* System Load */}
                <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${getSystemLoadBg(systemLoad)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                    <p className="text-sm font-medium text-gray-600">System Load</p>
                      <p className={`text-3xl font-bold mt-2 ${getSystemLoadColor(systemLoad)}`}>
                        {systemLoad !== null ? `${Math.round(systemLoad * 100)}%` : (loading ? '—' : 'N/A')}
                      </p>
                      <div className="flex items-center mt-2">
                        <Activity className={`h-4 w-4 mr-1 ${getSystemLoadColor(systemLoad)}`} />
                        <span className={`text-sm ${getSystemLoadColor(systemLoad)}`}>
                        {systemLoad !== null && systemLoad < 0.5 ? 'Optimal' :
                            systemLoad !== null && systemLoad < 0.8 ? 'Moderate' :
                                systemLoad !== null ? 'High' : 'Unknown'}
                      </span>
                      </div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-full">
                      <Zap className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>
              
                {/* API Calls */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                    <p className="text-sm font-medium text-gray-600">API Calls</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {apiCalls !== null ? new Intl.NumberFormat('en', { notation: 'compact' }).format(Math.floor(apiCalls)) : (loading ? '—' : 'N/A')}
                      </p>
                      <div className="flex items-center mt-2">
                        <BarChart3 className="h-4 w-4 text-orange-500 mr-1" />
                        <span className="text-sm text-gray-600">Today</span>
                      </div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-full">
                      <Server className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Enhanced System Health */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-gray-900">Service Status</h2>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span className="text-xs text-gray-600">Healthy</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-red-500"></div>
                          <span className="text-xs text-gray-600">Down</span>
                  </div>
                </div>
                  </div>
                </div>
                  <div className="p-6">
                    {loading && (
                        <div className="flex items-center justify-center py-8">
                          <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                          <span className="ml-2 text-gray-500">Loading services...</span>
                  </div>
                    )}
                    {!loading && health.length === 0 && (
                        <div className="flex items-center justify-center py-8 text-gray-500">
                          <AlertTriangle className="h-6 w-6 mr-2" />
                          No service data available
                </div>
                    )}
                    <div className="grid gap-3">
                      {health.map((svc) => (
                          <div key={svc.name} className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                              svc.status === 'UP'
                                  ? 'bg-green-50 border-green-200 hover:bg-green-100'
                                  : 'bg-red-50 border-red-200 hover:bg-red-100'
                          }`}>
                  <div className="flex items-center">
                              {svc.status === 'UP' ? (
                                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                              ) : (
                                  <XCircle className="h-5 w-5 text-red-600 mr-3" />
                              )}
                              <div>
                            <span className={`font-medium ${svc.status === 'UP' ? 'text-green-800' : 'text-red-800'}`}>
                              {svc.name}
                            </span>
                                <p className={`text-sm ${svc.status === 'UP' ? 'text-green-600' : 'text-red-600'}`}>
                                  {svc.status === 'UP' ? 'Service is running normally' : 'Service is not responding'}
                                </p>
                              </div>
                  </div>
                            <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              svc.status === 'UP'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                          }`}>
                            {svc.status === 'UP' ? 'Healthy' : 'Down'}
                          </span>
                </div>
                  </div>
                      ))}
                </div>
              </div>
            </div>

                {/* Quick Overview card only (User Management moved to dashboard) */}
                <div className="space-y-6">

                  {/* Quick Stats */}
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm text-white">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Quick Overview</h3>
                <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-blue-100">Uptime</span>
                          <span className="font-semibold">99.9%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-blue-100">Response Time</span>
                          <span className="font-semibold">125ms</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-blue-100">Storage Used</span>
                          <span className="font-semibold">67%</span>
                        </div>
                </div>
              </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
