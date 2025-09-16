"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plane, Search, Clock, MapPin, Users, Phone, MessageSquare, Info, Calendar, Bell, Filter, RefreshCw } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import scheduleService, { type WorkSchedule } from "@/lib/schedule-service"
import flightService, { type Flight } from "@/lib/flight-service"
import staffService, { type StaffMember } from "@/lib/staff-service"

export function AgentDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [schedules, setSchedules] = useState<WorkSchedule[]>([])
  const [flights, setFlights] = useState<Flight[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")

  const loadData = async () => {
    if (!user) return
    setLoading(true)
    try {
      const [sched, fl, st] = await Promise.all([
        scheduleService.getUpcomingByStaff(Number(user.id)).catch(() => []),
        flightService.getAllFlights().catch(() => []),
        staffService.getAllStaff(0, 20).then(r => r.content).catch(() => []),
      ])
      setSchedules(sched)
      setFlights(fl)
      setStaff(st)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // Auto-refresh every 2 minutes for real-time data
    const interval = setInterval(loadData, 120000)
    return () => clearInterval(interval)
  }, [user])

  const filteredFlights = useMemo(() => {
    let filtered = flights

    if (searchTerm) {
      filtered = filtered.filter(f =>
          f.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.gate?.toString().includes(searchTerm)
      )
    }

    if (selectedFilter !== "all") {
      filtered = filtered.filter(f => f.status?.id === selectedFilter)
    }

    return filtered
  }, [flights, searchTerm, selectedFilter])

  const activeFlights = useMemo(() => flights.length, [flights])
  const unreadMessages = 3 // Mock data
  const myShiftRemaining = "4h 23m" // Mock data

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'BOARDING': return 'bg-blue-500'
      case 'DEPARTED': return 'bg-green-500'
      case 'DELAYED': return 'bg-red-500'
      case 'SCHEDULED': return 'bg-gray-500'
      default: return 'bg-gray-400'
    }
  }

  const getStatusBadgeVariant = (status: string | undefined) => {
    switch (status) {
      case 'BOARDING': return 'default'
      case 'DEPARTED': return 'secondary'
      case 'DELAYED': return 'destructive'
      default: return 'outline'
    }
  }

  return (
      <div className="space-y-6 p-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {user?.firstName}</h1>
              <p className="text-blue-100 mt-1">Here's your flight operations overview</p>
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
                Refresh
              </Button>
            </div>
          </div>
        </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-emerald-100">My Shift Status</CardTitle>
              <Clock className="h-5 w-5 text-emerald-200" />
          </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{myShiftRemaining}</div>
              <p className="text-xs text-emerald-200">Time remaining today</p>
          </CardContent>
        </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-blue-100">Active Flights</CardTitle>
              <Plane className="h-5 w-5 text-blue-200" />
          </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{activeFlights}</div>
              <p className="text-xs text-blue-200">Currently monitoring</p>
          </CardContent>
        </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-orange-100">Messages</CardTitle>
              <MessageSquare className="h-5 w-5 text-orange-200" />
          </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{unreadMessages}</div>
              <p className="text-xs text-orange-200">Unread notifications</p>
          </CardContent>
        </Card>
      </div>

        {/* Flight Information with enhanced search */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Flight Information</CardTitle>
                <CardDescription>Search and monitor real-time flight details</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-sm text-gray-600">Live Updates</span>
              </div>
            </div>
        </CardHeader>
          <CardContent className="p-6">
            {/* Enhanced Search Bar */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Search by flight number, route, or gate..."
                    className="pl-10 h-11"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <select
                    className="px-4 py-2 border rounded-lg bg-white text-sm min-w-[120px]"
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="BOARDING">Boarding</option>
                  <option value="DEPARTED">Departed</option>
                  <option value="DELAYED">Delayed</option>
                  <option value="SCHEDULED">Scheduled</option>
                </select>
                <Button className="bg-blue-600 hover:bg-blue-700 h-11">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
              </div>
          </div>

            {/* Flight Results */}
            <div className="space-y-4">
              {filteredFlights.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <Plane className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No flights match your search</p>
                    <p className="text-gray-400 text-sm">Try adjusting your search terms or filters</p>
                    </div>
              )}

              {loading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex space-x-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
              )}

              {filteredFlights.slice(0, 8).map((f) => (
                  <div key={f.id} className="p-5 border-2 border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-md transition-all duration-200 bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="p-3 bg-blue-50 rounded-xl">
                            <Plane className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${getStatusColor(f.status?.id)}`}></div>
                        </div>
                        <div>
                          <p className="font-bold text-lg text-gray-900">{f.flightNumber}</p>
                          <p className="text-gray-600 font-medium">{f.origin} → {f.destination}</p>
                        </div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(f.status?.id)} className="px-3 py-1 font-medium">
                        {f.status?.id ?? 'UNKNOWN'}
                  </Badge>
                </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900">Departure</p>
                          <p className="text-gray-600">{f.departureTime?.slice(11,16) ?? '--:--'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900">Gate</p>
                          <p className="text-gray-600">{f.gate || 'TBD'}</p>
                        </div>
                  </div>
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                        <Users className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900">Passengers</p>
                          <p className="text-gray-600">{f.passengerCount ?? 'N/A'}</p>
                  </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enhanced Staff Directory */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <CardTitle className="text-xl">Staff Directory</CardTitle>
              <CardDescription>Contact information for on-duty personnel</CardDescription>
          </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {staff.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p>No staff members available</p>
                    </div>
                )}
                {staff.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-md transition-all duration-200 bg-white">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {s.firstName[0]}{s.lastName[0]}
                        </div>
                <div>
                          <p className="font-semibold text-gray-900">{s.firstName} {s.lastName}</p>
                          <p className="text-sm text-gray-600">{s.roleDisplayName}</p>
                          <p className="text-xs text-gray-500">ID: {s.id}</p>
                        </div>
                </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                          {s.statusDisplayName}
                  </Badge>
                        <Button variant="ghost" size="sm" className="h-10 w-10 p-0 hover:bg-blue-50">
                          <Phone className="h-4 w-4 text-blue-600" />
                  </Button>
                </div>
              </div>
            ))}
              </div>
          </CardContent>
        </Card>

          {/* Enhanced Quick Actions */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <CardTitle className="text-xl">Quick Actions</CardTitle>
              <CardDescription>Common agent tasks and shortcuts</CardDescription>
          </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2 border-2 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Info className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">Flight Info</span>
              </Button>

              <Button
                variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2 border-2 hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
                >
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors relative">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                    {unreadMessages > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                          {unreadMessages}
                        </div>
                    )}
                  </div>
                  <span className="text-sm font-medium">Messages</span>
              </Button>

              <Button
                variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2 border-2 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group"
                >
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium">Staff Lookup</span>
              </Button>

              <Button
                variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2 border-2 hover:border-red-300 hover:bg-red-50 transition-all duration-200 group"
                >
                  <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                    <Phone className="h-5 w-5 text-red-600" />
                  </div>
                  <span className="text-sm font-medium">Emergency</span>
                </Button>
              </div>

              {/* Additional Quick Links */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Quick Links</h4>
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start h-auto p-3 hover:bg-gray-50">
                    <Calendar className="h-4 w-4 mr-3 text-gray-500" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">View Schedule</p>
                      <p className="text-xs text-gray-500">Check your upcoming shifts</p>
                    </div>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start h-auto p-3 hover:bg-gray-50">
                    <Bell className="h-4 w-4 mr-3 text-gray-500" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Notifications</p>
                      <p className="text-xs text-gray-500">System alerts and updates</p>
                    </div>
              </Button>
            </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Schedule */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <CardTitle className="text-xl">Today's Schedule</CardTitle>
            <CardDescription>Your upcoming shifts and assignments</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {schedules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p>No scheduled shifts for today</p>
                  <p className="text-sm text-gray-400">Enjoy your day off!</p>
                </div>
            ) : (
                <div className="space-y-3">
                  {schedules.map((schedule, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                        <div className="p-2 bg-blue-200 rounded-lg">
                          <Clock className="h-5 w-5 text-blue-700" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-blue-900">Shift Assignment</p>
                          <p className="text-sm text-blue-700">Terminal Operations</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-900">08:00 - 16:00</p>
                          <p className="text-sm text-blue-600">8 hours</p>
                        </div>
                      </div>
                  ))}
                </div>
            )}
          </CardContent>
        </Card>
    </div>
  )
}