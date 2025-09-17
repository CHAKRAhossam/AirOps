"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Plane, Users, Clock, AlertTriangle, Calendar, TrendingUp, MapPin, RefreshCw, BarChart3, Settings, CheckCircle, XCircle, Timer } from "lucide-react"
import reportingService from "@/lib/reporting-service"
import staffService, { type StaffMember } from "@/lib/staff-service"
import flightService, { type Flight } from "@/lib/flight-service"
import scheduleService, { type WorkSchedule } from "@/lib/schedule-service"

export function SupervisorDashboard() {
  const [todayFlights, setTodayFlights] = useState<number | null>(null)
  const [onDutyCount, setOnDutyCount] = useState<number | null>(null)
  const [onTimePct, setOnTimePct] = useState<number | null>(null)
  const [alerts, setAlerts] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [flights, setFlights] = useState<Flight[]>([])
  const [todaySchedules, setTodaySchedules] = useState<WorkSchedule[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])

  // Local date formatter (yyyy-MM-dd) without timezone shifts
  const formatDateISO = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const [flightsRpt] = await Promise.all([
        reportingService.getFlightReports({ period: "today" }).catch(() => null),
      ])
      if (flightsRpt) {
        const total = flightsRpt.totalFlights ?? 0
        const delayed = flightsRpt.byStatus?.DELAYED ?? 0
        const cancelled = flightsRpt.byStatus?.CANCELLED ?? 0
        const onTime = Math.max(total - delayed - cancelled, 0)
        setTodayFlights(total)
        setOnTimePct(total > 0 ? Math.round((onTime / total) * 100) : 0)
        setAlerts((delayed + cancelled) || 0)
      }
      // Fetch live resources for dynamic sections
      const [flList, staffResp, scheds] = await Promise.all([
        flightService.getAllFlights().catch(() => []),
        staffService.getAllStaff(0, 100).catch(() => null),
        scheduleService.getSchedulesByDate(formatDateISO(new Date())).catch(() => []),
      ])
      setFlights(flList)
      setStaff(staffResp?.content ?? [])
      setOnDutyCount(staffResp ? staffResp.totalElements : null)
      setTodaySchedules(scheds)
      setLastUpdated(new Date())
    } catch {} finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // Auto-refresh every 60 seconds
    const interval = setInterval(loadData, 60000)
    return () => clearInterval(interval)
  }, [])

  // Dynamic computed data
  const flightOperations = flights.slice(0, 5).map((f) => {
    const crewAssigned = todaySchedules.filter(s => s.flightId === f.id).length
    return {
      flight: f.flightNumber,
      route: `${f.origin} → ${f.destination}`,
      status: f.status?.id ?? "UNKNOWN",
      time: f.departureTime?.slice(11,16) ?? "--:--",
      gate: f.gate || "TBD",
      passengers: typeof f.passengerCount === 'number' ? f.passengerCount : 0,
      crew: crewAssigned,
    }
  })

  const staffAssignments = todaySchedules.slice(0, 8).map((s) => {
    const staffMember = staff.find(m => Number(m.id) === Number(s.staffId))
    return {
      name: staffMember ? `${staffMember.firstName} ${staffMember.lastName}` : `Staff #${s.staffId}`,
      role: staffMember?.roleDisplayName || staffMember?.staffRole?.id || "STAFF",
      flight: s.flightId ? String(s.flightId) : (s.location || "N/A"),
      status: s.status,
      location: s.location || (s.flightId ? `Flight ${s.flightId}` : "N/A"),
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'BOARDING': return 'bg-blue-500'
      case 'DEPARTED': return 'bg-green-500'
      case 'DELAYED': return 'bg-red-500'
      case 'SCHEDULED': return 'bg-gray-500'
      default: return 'bg-gray-400'
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'BOARDING': return 'default'
      case 'DEPARTED': return 'secondary'
      case 'DELAYED': return 'destructive'
      case 'ACTIVE': return 'default'
      case 'STANDBY': return 'secondary'
      case 'BUSY': return 'outline'
      default: return 'outline'
    }
  }

  return (
      <div className="space-y-8 p-6">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Operations Control Center</h1>
              <p className="text-blue-100 mt-1">Monitor and manage flight operations in real-time</p>
              <div className="flex items-center space-x-4 mt-3 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span>All systems operational</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                  variant="secondary"
                  size="sm"
                  onClick={loadData}
                  disabled={loading}
                  className="bg-white/20 hover:bg-white/30 border-0"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
              <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 border-0"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-blue-100">Today's Flights</CardTitle>
              <Plane className="h-5 w-5 text-blue-200" />
          </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{todayFlights ?? '—'}</div>
              <p className="text-xs text-blue-200">
                +12% from yesterday
              </p>
          </CardContent>
        </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-emerald-100">On-Duty Staff</CardTitle>
              <Users className="h-5 w-5 text-emerald-200" />
          </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{onDutyCount ?? '—'}</div>
              <p className="text-xs text-emerald-200">
                {onDutyCount ? `${Math.round((onDutyCount * 0.85))} active` : 'Loading...'}
              </p>
          </CardContent>
        </Card>

          <Card className={`border-0 shadow-lg overflow-hidden relative text-white ${
              (onTimePct ?? 0) >= 90 ? 'bg-gradient-to-br from-green-500 to-green-600' :
                  (onTimePct ?? 0) >= 80 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                      'bg-gradient-to-br from-red-500 to-red-600'
          }`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium opacity-90">On-Time Performance</CardTitle>
              <Clock className="h-5 w-5 opacity-80" />
          </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{onTimePct !== null ? `${onTimePct}%` : '—'}</div>
              <p className="text-xs opacity-80">
                {(onTimePct ?? 0) >= 90 ? 'Excellent' : (onTimePct ?? 0) >= 80 ? 'Good' : 'Needs attention'}
              </p>
          </CardContent>
        </Card>

          <Card className={`border-0 shadow-lg overflow-hidden relative text-white ${
              (alerts ?? 0) === 0 ? 'bg-gradient-to-br from-green-500 to-green-600' :
                  (alerts ?? 0) <= 3 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                      'bg-gradient-to-br from-red-500 to-red-600'
          }`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium opacity-90">Active Alerts</CardTitle>
              <AlertTriangle className="h-5 w-5 opacity-80" />
          </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{alerts ?? '—'}</div>
              <p className="text-xs opacity-80">
                {(alerts ?? 0) === 0 ? 'All clear' : `${alerts} issues to review`}
              </p>
          </CardContent>
        </Card>
      </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Enhanced Flight Operations */}
          <Card className="xl:col-span-2 border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Flight Operations</CardTitle>
                  <CardDescription>Real-time flight status and crew assignments</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                </div>
              </div>
          </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {flightOperations.length === 0 && (
                  <div className="text-sm text-gray-500">{loading ? 'Loading flights…' : 'No flights found.'}</div>
                )}
                {flightOperations.map((flight) => (
                    <div key={flight.flight} className="p-5 border-2 border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="p-3 bg-blue-50 rounded-xl">
                              <Plane className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${getStatusColor(flight.status)}`}></div>
                  </div>
                  <div>
                            <p className="font-bold text-lg text-gray-900">{flight.flight}</p>
                            <p className="text-gray-600 font-medium">{flight.route}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                              variant={getStatusBadgeVariant(flight.status)}
                              className="mb-2 px-3 py-1 font-medium"
                  >
                    {flight.status}
                  </Badge>
                          <p className="text-sm text-gray-500">
                    {flight.time} • Gate {flight.gate}
                  </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <Users className="h-5 w-5 text-blue-600" />
                            <div className="text-right">
                              <p className="text-lg font-bold text-blue-900">{flight.passengers}</p>
                              <p className="text-xs text-blue-600">Passengers</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <Users className="h-5 w-5 text-green-600" />
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-900">{flight.crew}</p>
                              <p className="text-xs text-green-600">Crew Members</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <MapPin className="h-5 w-5 text-purple-600" />
                            <div className="text-right">
                              <p className="text-lg font-bold text-purple-900">{flight.gate}</p>
                              <p className="text-xs text-purple-600">Gate</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Staff Management */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <CardTitle className="text-xl">Staff Management</CardTitle>
              <CardDescription>Current assignments and availability</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {staffAssignments.length === 0 && (
                  <div className="text-sm text-gray-500">{loading ? 'Loading assignments…' : 'No assignments for today.'}</div>
                )}
                {staffAssignments.map((staff, index) => (
                    <div key={index} className="p-4 border-2 border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-md transition-all duration-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {staff.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{staff.name}</p>
                            <p className="text-xs text-gray-500">{staff.role.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(staff.status)} className="text-xs">
                          {staff.status}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Assignment:</span>
                          <span className="font-medium text-gray-900">{staff.flight}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium text-gray-900">{staff.location}</span>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <CardTitle className="text-xl">Performance Metrics</CardTitle>
              <CardDescription>Key operational indicators</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">On-Time Departure</span>
                    <span className="text-lg font-bold text-green-600">{onTimePct}%</span>
                  </div>
                  <Progress value={onTimePct || 0} className="h-3" />
                  <p className="text-xs text-gray-500 mt-1">Target: 85%</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">Gate Utilization</span>
                    <span className="text-lg font-bold text-blue-600">78%</span>
                  </div>
                  <Progress value={78} className="h-3" />
                  <p className="text-xs text-gray-500 mt-1">23 of 30 gates active</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">Staff Efficiency</span>
                    <span className="text-lg font-bold text-purple-600">92%</span>
                  </div>
                  <Progress value={92} className="h-3" />
                  <p className="text-xs text-gray-500 mt-1">Above target performance</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">Customer Satisfaction</span>
                    <span className="text-lg font-bold text-emerald-600">4.2/5</span>
                  </div>
                  <Progress value={84} className="h-3" />
                  <p className="text-xs text-gray-500 mt-1">Based on recent feedback</p>
                </div>
              </div>
          </CardContent>
        </Card>

          {/* Real-time Alerts */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <CardTitle className="text-xl">Real-time Alerts</CardTitle>
              <CardDescription>System notifications and priority issues</CardDescription>
          </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-800">Flight AA789 Delayed</p>
                      <p className="text-sm text-red-600">Weather conditions at ORD causing 45min delay</p>
                      <p className="text-xs text-red-500 mt-1">2 minutes ago</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Timer className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-800">Gate B8 Maintenance</p>
                      <p className="text-sm text-yellow-600">Scheduled maintenance starting in 30 minutes</p>
                      <p className="text-xs text-yellow-500 mt-1">5 minutes ago</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Users className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                      <p className="font-semibold text-blue-800">Staff Assignment Update</p>
                      <p className="text-sm text-blue-600">New crew assigned to AA321 departure</p>
                      <p className="text-xs text-blue-500 mt-1">8 minutes ago</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-800">AA456 Departed On-Time</p>
                      <p className="text-sm text-green-600">Successfully departed from Gate B8</p>
                      <p className="text-xs text-green-500 mt-1">12 minutes ago</p>
                    </div>
                  </div>
                </div>
              </div>
          </CardContent>
        </Card>
      </div>

        {/* Enhanced Quick Actions */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <CardTitle className="text-xl">Supervisor Tools</CardTitle>
            <CardDescription>Quick access to essential management functions</CardDescription>
        </CardHeader>
          <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
                  className="h-24 flex flex-col items-center justify-center space-y-3 border-2 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
              >
                <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-center">
                  <span className="text-sm font-semibold text-gray-900">Schedule</span>
                  <p className="text-xs text-gray-500">Manage staff schedules</p>
                </div>
            </Button>

            <Button
              variant="outline"
                  className="h-24 flex flex-col items-center justify-center space-y-3 border-2 hover:border-red-300 hover:bg-red-50 transition-all duration-200 group"
              >
                <div className="p-3 bg-red-100 rounded-xl group-hover:bg-red-200 transition-colors relative">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                  {alerts && alerts > 0 && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                        {alerts}
                      </div>
                  )}
                </div>
                <div className="text-center">
                  <span className="text-sm font-semibold text-gray-900">Alerts</span>
                  <p className="text-xs text-gray-500">View active issues</p>
                </div>
            </Button>

            <Button
              variant="outline"
                  className="h-24 flex flex-col items-center justify-center space-y-3 border-2 hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
              >
                <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-center">
                  <span className="text-sm font-semibold text-gray-900">Reports</span>
                  <p className="text-xs text-gray-500">Performance analytics</p>
                </div>
            </Button>

            <Button
              variant="outline"
                  className="h-24 flex flex-col items-center justify-center space-y-3 border-2 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group"
              >
                <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-center">
                  <span className="text-sm font-semibold text-gray-900">Gates</span>
                  <p className="text-xs text-gray-500">Manage gate assignments</p>
                </div>
              </Button>
            </div>

            {/* Additional Management Tools */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4">Management Tools</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button variant="ghost" className="justify-start h-auto p-4 hover:bg-gray-50 border border-gray-200">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Staff Dashboard</p>
                    <p className="text-xs text-gray-500">View all staff assignments and status</p>
                  </div>
                </Button>

                <Button variant="ghost" className="justify-start h-auto p-4 hover:bg-gray-50 border border-gray-200">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Analytics Hub</p>
                    <p className="text-xs text-gray-500">Detailed performance metrics and trends</p>
                  </div>
                </Button>

                <Button variant="ghost" className="justify-start h-auto p-4 hover:bg-gray-50 border border-gray-200">
                  <div className="p-2 bg-orange-100 rounded-lg mr-3">
                    <Settings className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">System Settings</p>
                    <p className="text-xs text-gray-500">Configure operational parameters</p>
                  </div>
                </Button>

                <Button variant="ghost" className="justify-start h-auto p-4 hover:bg-gray-50 border border-gray-200">
                  <div className="p-2 bg-red-100 rounded-lg mr-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Emergency Protocols</p>
                    <p className="text-xs text-gray-500">Access emergency procedures and contacts</p>
                  </div>
            </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Summary */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <CardHeader>
            <CardTitle className="text-xl">Today's Operations Summary</CardTitle>
            <CardDescription className="text-gray-300">Key metrics and achievements for today</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">{todayFlights || 0}</div>
                <p className="text-gray-300 text-sm">Total Flights</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{onTimePct || 0}%</div>
                <p className="text-gray-300 text-sm">On-Time Rate</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">{onDutyCount || 0}</div>
                <p className="text-gray-300 text-sm">Staff On Duty</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">
                  {todayFlights ? Math.floor(todayFlights * 150) : 0}
                </div>
                <p className="text-gray-300 text-sm">Passengers Served</p>
              </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}