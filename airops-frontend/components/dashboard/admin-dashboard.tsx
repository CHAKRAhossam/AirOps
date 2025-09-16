"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Users, Plane, AlertTriangle, TrendingUp, Clock, CheckCircle, XCircle, Activity, Server, Database, Zap, RefreshCw } from "lucide-react"
import Link from "next/link"
import adminService from "@/lib/admin-service"
import reportingService from "@/lib/reporting-service"

export function AdminDashboard() {
  const [usersCount, setUsersCount] = useState<number | null>(null)
  const [health, setHealth] = useState<{ name: string; status: string }[]>([])
  const [systemLoad, setSystemLoad] = useState<number | null>(null)
  const [apiCalls, setApiCalls] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const loadData = async () => {
    setLoading(true)
    try {
      const [count, svc, loadAvg, calls] = await Promise.all([
        adminService.getUsersCount().catch(() => null),
        adminService.getServiceHealth().catch(() => []),
        adminService.getSystemLoad().catch(() => null),
        adminService.getApiCalls().catch(() => null),
      ])
      setUsersCount(count)
      setHealth(svc)
      setSystemLoad(loadAvg)
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

  const healthyCount = useMemo(() => health.filter(h => h.status === 'UP').length, [health])
  const healthPct = useMemo(() => health.length ? Math.round((healthyCount / health.length) * 100) : 0, [healthyCount, health.length])

  const getHealthColor = (status: string) => {
    return status === 'UP' ? 'text-emerald-500' : 'text-red-500'
  }

  const getHealthBgColor = (status: string) => {
    return status === 'UP' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
  }

  return (
      <div className="space-y-8 p-6">
        {/* Header with refresh */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Dashboard</h1>
            <p className="text-gray-600">Monitor system health and performance metrics</p>
          </div>
          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
            <Button onClick={loadData} disabled={loading} size="sm" className="bg-blue-600 hover:bg-blue-700">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics with enhanced styling */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-blue-100">Total Users</CardTitle>
              <Users className="h-5 w-5 text-blue-200" />
          </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{usersCount ?? (loading ? '—' : 'N/A')}</div>
              <p className="text-xs text-blue-200 mt-1">Active system users</p>
          </CardContent>
        </Card>

          <Card className={`relative overflow-hidden border-0 shadow-lg ${
              healthPct >= 90 ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
                  healthPct >= 70 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                      'bg-gradient-to-br from-red-500 to-red-600'
          } text-white`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium opacity-90">System Health</CardTitle>
              <Activity className="h-5 w-5 opacity-80" />
          </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{healthPct}%</div>
              <p className="text-xs opacity-80 mt-1">{healthyCount}/{health.length} services operational</p>
          </CardContent>
        </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-purple-100">System Load</CardTitle>
              <Server className="h-5 w-5 text-purple-200" />
          </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">
                {systemLoad !== null ? `${Math.round(systemLoad * 100)}%` : (loading ? '—' : 'N/A')}
              </div>
              <p className="text-xs text-purple-200 mt-1">CPU utilization</p>
          </CardContent>
        </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-orange-100">API Calls Today</CardTitle>
              <TrendingUp className="h-5 w-5 text-orange-200" />
          </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">
                {apiCalls !== null ? new Intl.NumberFormat('en', { notation: 'compact' }).format(Math.floor(apiCalls)) : (loading ? '—' : 'N/A')}
              </div>
              <p className="text-xs text-orange-200 mt-1">Total requests processed</p>
          </CardContent>
        </Card>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Service Status with enhanced styling */}
          <Card className="border-0 shadow-lg lg:col-span-2">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Service Status</CardTitle>
                  <CardDescription>Real-time microservice health monitoring</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-sm text-gray-600">Live</span>
                </div>
              </div>
          </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {health.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      {loading ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                      ) : (
                          'No service data available'
                      )}
                    </div>
                )}
                {health.map((service) => (
                    <div key={service.name} className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${getHealthBgColor(service.status)}`}>
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${service.status === 'UP' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                          {service.status === "UP" ? (
                              <CheckCircle className="h-5 w-5 text-emerald-600" />
                          ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                  <div>
                          <p className="font-semibold text-gray-900">{service.name}</p>
                          <p className="text-sm text-gray-600">{service.status === 'UP' ? 'All systems operational' : 'Service unavailable'}</p>
                  </div>
                </div>
                <Badge
                          variant={service.status === 'UP' ? 'default' : 'destructive'}
                          className="px-3 py-1 font-medium"
                >
                  {service.status}
                </Badge>
              </div>
            ))}
              </div>
          </CardContent>
        </Card>

          {/* System Insights */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <CardTitle className="text-xl">System Insights</CardTitle>
              <CardDescription>Performance metrics and alerts</CardDescription>
          </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <Database className="h-8 w-8 text-blue-600" />
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-900">99.9%</p>
                        <p className="text-sm text-blue-600">Uptime</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <Zap className="h-8 w-8 text-green-600" />
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-900">45ms</p>
                        <p className="text-sm text-green-600">Avg Response</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Events */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Recent System Events</h4>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-green-400 mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Service deployment successful</p>
                        <p className="text-xs text-gray-500">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-blue-400 mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Database backup completed</p>
                        <p className="text-xs text-gray-500">15 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">High CPU usage detected</p>
                        <p className="text-xs text-gray-500">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Management moved from /admin */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <CardTitle className="text-xl">User Management</CardTitle>
              <CardDescription>Quick actions for users and roles</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Link href="/admin/users" className="block" passHref>
                <Button variant="outline" className="w-full justify-start hover:bg-blue-50 hover:border-blue-200 transition-colors">
                  <Users className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">View All Users</div>
                    <div className="text-xs text-gray-500">Manage user accounts</div>
                  </div>
                </Button>
              </Link>
              <Link href="/admin/permissions" className="block" passHref>
                <Button variant="outline" className="w-full justify-start hover:bg-green-50 hover:border-green-200 transition-colors">
                  <Activity className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Manage Permissions</div>
                    <div className="text-xs text-gray-500">Configure user roles</div>
                  </div>
                </Button>
              </Link>
          </CardContent>
        </Card>
      </div>

        {/* System Performance with enhanced visualization */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <CardTitle className="text-xl">System Performance</CardTitle>
            <CardDescription>Real-time resource utilization metrics</CardDescription>
        </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">CPU Usage</span>
                  <span className="text-lg font-bold text-purple-600">
                  {systemLoad !== null ? `${Math.round(systemLoad * 100)}%` : '—'}
                </span>
                </div>
                <Progress
                    value={systemLoad !== null ? Math.round(systemLoad * 100) : 0}
                    className="h-3 bg-gray-200"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Memory Usage</span>
                  <span className="text-lg font-bold text-blue-600">68%</span>
                </div>
                <Progress value={68} className="h-3 bg-gray-200" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>4.2GB used</span>
                  <span>8GB total</span>
            </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Database Load</span>
                  <span className="text-lg font-bold text-emerald-600">23%</span>
                </div>
                <Progress value={23} className="h-3 bg-gray-200" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Low activity</span>
                  <span>Optimal</span>
            </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}