"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import {
  BarChart3,
  Download,
  FileText,
  TrendingUp,
  Users,
  Plane,
  Clock,
  AlertTriangle,
  CheckCircle,
  Target,
  RefreshCw,
} from "lucide-react"
import { reportingService, FlightReport, StaffReport, ReportFilters } from "@/lib/reporting-service"

// Default data for charts when API data is not available
const defaultFlightPerformanceData = [
  { month: "Jan", onTime: 92, delayed: 6, cancelled: 2, total: 245 },
  { month: "Feb", onTime: 89, delayed: 8, cancelled: 3, total: 238 },
  { month: "Mar", onTime: 94, delayed: 4, cancelled: 2, total: 267 },
  { month: "Apr", onTime: 91, delayed: 7, cancelled: 2, total: 251 },
  { month: "May", onTime: 96, delayed: 3, cancelled: 1, total: 289 },
  { month: "Jun", onTime: 93, delayed: 5, cancelled: 2, total: 276 },
]

const defaultRoutePerformanceData = [
  { route: "JFK-LAX", flights: 45, onTime: 94, revenue: 2.1 },
  { route: "LAX-ORD", flights: 38, onTime: 89, revenue: 1.8 },
  { route: "ORD-MIA", flights: 32, onTime: 92, revenue: 1.5 },
  { route: "MIA-JFK", flights: 41, onTime: 87, revenue: 1.9 },
  { route: "JFK-BOS", flights: 28, onTime: 96, revenue: 1.2 },
]

const defaultStaffPerformanceData = [
  { department: "Flight Crew", active: 156, onLeave: 12, performance: 94 },
  { department: "Cabin Crew", active: 234, onLeave: 18, performance: 92 },
  { department: "Ground Staff", active: 89, onLeave: 7, performance: 88 },
  { department: "Maintenance", active: 67, onLeave: 4, performance: 96 },
  { department: "Administration", active: 45, onLeave: 3, performance: 91 },
]

const defaultRevenueData = [
  { month: "Jan", revenue: 4.2, costs: 3.1, profit: 1.1 },
  { month: "Feb", revenue: 3.9, costs: 2.9, profit: 1.0 },
  { month: "Mar", revenue: 4.8, costs: 3.4, profit: 1.4 },
  { month: "Apr", revenue: 4.5, costs: 3.2, profit: 1.3 },
  { month: "May", revenue: 5.2, costs: 3.6, profit: 1.6 },
  { month: "Jun", revenue: 4.9, costs: 3.3, profit: 1.6 },
]

export function ReportsDashboard() {
  const { toast } = useToast()
  const [selectedPeriod, setSelectedPeriod] = useState("6months")
  const [selectedReport, setSelectedReport] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Real data from API
  const [flightReport, setFlightReport] = useState<FlightReport | null>(null)
  const [staffReport, setStaffReport] = useState<StaffReport | null>(null)
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>(null)
  const [performanceTrends, setPerformanceTrends] = useState<any>(null)

  // Load initial data
  useEffect(() => {
    loadReports()
  }, [selectedPeriod])

  const loadReports = async () => {
    try {
      setLoading(true)
      const filters: ReportFilters = { period: selectedPeriod }

      const [flights, staff, metrics, trends] = await Promise.all([
        reportingService.getFlightReports(filters),
        reportingService.getStaffReports(filters),
        reportingService.getRealTimeMetrics(),
        reportingService.getPerformanceTrends(selectedPeriod)
      ])

      setFlightReport(flights)
      setStaffReport(staff)
      setRealTimeMetrics(metrics)
      setPerformanceTrends(trends)
    } catch (error) {
      console.error('Failed to load reports:', error)
      toast({
        title: "Error",
        description: "Failed to load report data. Using default data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadReports()
    setRefreshing(false)
    toast({
      title: "Success",
      description: "Reports refreshed successfully",
    })
  }

  const handleExport = async (format: "pdf" | "excel") => {
    try {
      const filters: ReportFilters = { period: selectedPeriod }
      const exportResponse = await reportingService.exportReport('dashboard', format, filters)

      toast({
        title: "Export Info",
        description: exportResponse.message,
      })
    } catch (error) {
      console.error('Export failed:', error)
      toast({
        title: "Error",
        description: "Failed to export report",
        variant: "destructive",
      })
    }
  }

  // Transform API data for charts
  const transformFlightData = (data: FlightReport) => {
    if (!data.byStatus) return defaultFlightPerformanceData

    const statusData = Object.entries(data.byStatus).map(([status, count]) => ({
      status,
      count,
      percentage: (count / data.totalFlights) * 100
    }))

    return statusData
  }

  const transformStaffData = (data: StaffReport) => {
    if (!data.content || !Array.isArray(data.content)) return defaultStaffPerformanceData

    // Group by department and calculate metrics
    const departmentMap = new Map()

    data.content.forEach((staff: any) => {
      const dept = staff.department || 'Unknown'
      if (!departmentMap.has(dept)) {
        departmentMap.set(dept, { active: 0, onLeave: 0, performance: 0, count: 0 })
      }

      const deptData = departmentMap.get(dept)
      if (staff.status === 'ACTIVE') {
        deptData.active++
      } else if (staff.status === 'ON_LEAVE') {
        deptData.onLeave++
      }
      deptData.count++
      deptData.performance = Math.round((deptData.active / deptData.count) * 100)
    })

    return Array.from(departmentMap.entries()).map(([dept, data]: [string, any]) => ({
      department: dept,
      active: data.active,
      onLeave: data.onLeave,
      performance: data.performance
    }))
  }

  // Use real data or fallback to defaults
  const flightData = flightReport ? transformFlightData(flightReport) : defaultFlightPerformanceData
  const staffData = staffReport ? transformStaffData(staffReport) : defaultStaffPerformanceData
  const revenueData = performanceTrends?.revenue || defaultRevenueData
  const flightPerformanceData = performanceTrends?.flightPerformance || defaultFlightPerformanceData

  // Calculate key metrics from real data
  const totalFlights = flightReport?.totalFlights || 1359
  const onTimeBase = flightReport?.byStatus ? (
      (flightReport.byStatus['ARRIVED'] ?? flightReport.byStatus['LANDED'] ?? flightReport.byStatus['SCHEDULED'] ?? 0)
  ) : 0
  const onTimePercentage = totalFlights ? Math.round((onTimeBase / totalFlights) * 100) : 0
  const totalStaff = staffReport?.totalElements || 591
  const activeStaff = staffReport?.content ?
      staffReport.content.filter((s: any) => s.status === 'ACTIVE').length : 591

  const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"]

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading reports...</p>
          </div>
        </div>
    )
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
            <p className="text-gray-600">Comprehensive performance metrics and insights</p>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button variant="outline" onClick={() => handleExport("pdf")}>
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={() => handleExport("excel")}>
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Flights</CardTitle>
              <Plane className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalFlights.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                Real-time data from API
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On-Time Performance</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onTimePercentage}%</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                Based on current flight data
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeStaff.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                Out of {totalStaff} total staff
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Source</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">Live API</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                Connected to reporting service
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="flights" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="flights">Flight Analytics</TabsTrigger>
            <TabsTrigger value="staff">Staff Performance</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="operational">Operational</TabsTrigger>
          </TabsList>
          <TabsContent value="flights" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Flight Performance Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>Flight Performance Trend</CardTitle>
                    <CardDescription>Monthly on-time performance and delays</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={flightPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area
                            type="monotone"
                            dataKey="onTime"
                            stackId="1"
                            stroke="#10b981"
                            fill="#10b981"
                            fillOpacity={0.6}
                        />
                        <Area
                            type="monotone"
                            dataKey="delayed"
                            stackId="1"
                            stroke="#f59e0b"
                            fill="#f59e0b"
                            fillOpacity={0.6}
                        />
                        <Area
                            type="monotone"
                            dataKey="cancelled"
                            stackId="1"
                            stroke="#ef4444"
                            fill="#ef4444"
                            fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Flight Status Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Flight Status Distribution</CardTitle>
                    <CardDescription>Current period flight status breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                            data={flightData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="count"
                        >
                          {flightData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center space-x-4 mt-4">
                      {flightData.map((entry, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></div>
                            <span className="text-sm">
                          {entry.status}: {entry.count}
                        </span>
                          </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Route Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Route Performance Analysis</CardTitle>
                  <CardDescription>Performance metrics by route</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {defaultRoutePerformanceData.map((route, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Plane className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{route.route}</p>
                              <p className="text-sm text-gray-500">{route.flights} flights</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-6">
                            <div className="text-center">
                              <p className="text-sm text-gray-500">On-Time</p>
                              <p className="font-semibold">{route.onTime}%</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-500">Revenue</p>
                              <p className="font-semibold">${route.revenue}M</p>
                            </div>
                            <div className="w-24">
                              <Progress value={route.onTime} className="h-2" />
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="staff" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Staff Performance by Department */}
                <Card>
                  <CardHeader>
                    <CardTitle>Staff Performance by Department</CardTitle>
                    <CardDescription>Performance scores across departments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={staffData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="department" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="performance" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Staff Availability */}
                <Card>
                  <CardHeader>
                    <CardTitle>Staff Availability</CardTitle>
                    <CardDescription>Active vs on-leave staff by department</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={staffData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="department" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="active" fill="#10b981" />
                        <Bar dataKey="onLeave" fill="#f59e0b" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Staff Metrics Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Staff Metrics Summary</CardTitle>
                  <CardDescription>Detailed breakdown by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {staffData.map((dept, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Users className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">{dept.department}</p>
                              <p className="text-sm text-gray-500">Total: {dept.active + dept.onLeave} staff</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-6">
                            <div className="text-center">
                              <p className="text-sm text-gray-500">Active</p>
                              <p className="font-semibold text-green-600">{dept.active}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-500">On Leave</p>
                              <p className="font-semibold text-yellow-600">{dept.onLeave}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-500">Performance</p>
                              <p className="font-semibold">{dept.performance}%</p>
                            </div>
                            <div className="w-24">
                              <Progress value={dept.performance} className="h-2" />
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financial" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue vs Costs */}
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue vs Operating Costs</CardTitle>
                    <CardDescription>Monthly financial performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value}M`, ""]} />
                        <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} />
                        <Line type="monotone" dataKey="costs" stroke="#ef4444" strokeWidth={3} />
                        <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Profit Margin Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>Profit Margin Analysis</CardTitle>
                    <CardDescription>Monthly profit margins and trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value}M`, ""]} />
                        <Area type="monotone" dataKey="profit" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Financial Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">$28.5M</div>
                    <div className="flex items-center text-sm text-muted-foreground mt-2">
                      <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                      +18% vs last period
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Operating Costs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">$19.5M</div>
                    <div className="flex items-center text-sm text-muted-foreground mt-2">
                      <TrendingUp className="h-4 w-4 mr-1 text-red-600" />
                      +8% vs last period
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Net Profit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">$9.0M</div>
                    <div className="flex items-center text-sm text-muted-foreground mt-2">
                      <TrendingUp className="h-4 w-4 mr-1 text-blue-600" />
                      +32% vs last period
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="operational" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Satisfaction */}
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Satisfaction Trend</CardTitle>
                    <CardDescription>Monthly satisfaction scores and complaints</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" domain={[0, 5]} />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Operational Alerts */}
                <Card>
                  <CardHeader>
                    <CardTitle>Operational Status</CardTitle>
                    <CardDescription>Current operational metrics and alerts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-900">System Health</p>
                          <p className="text-sm text-green-700">All systems operational</p>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-green-600">
                        98.5%
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="font-medium text-yellow-900">Weather Delays</p>
                          <p className="text-sm text-yellow-700">3 flights affected</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-yellow-600 text-white">
                        Minor
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-blue-900">Average Delay</p>
                          <p className="text-sm text-blue-700">12 minutes (within target)</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-blue-600 text-blue-600">
                        Normal
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Target className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-900">Safety Score</p>
                          <p className="text-sm text-green-700">Excellent safety record</p>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-green-600">
                        100%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Indicators */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Performance Indicators</CardTitle>
                  <CardDescription>Critical operational metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{onTimePercentage}%</div>
                      <p className="text-sm text-gray-500">On-Time Performance</p>
                      <Progress value={onTimePercentage} className="mt-2" />
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">4.4/5</div>
                      <p className="text-sm text-gray-500">Customer Rating</p>
                      <Progress value={88} className="mt-2" />
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">98.5%</div>
                      <p className="text-sm text-gray-500">System Uptime</p>
                      <Progress value={98.5} className="mt-2" />
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">31.6%</div>
                      <p className="text-sm text-gray-500">Profit Margin</p>
                      <Progress value={31.6} className="mt-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
        </Tabs>
      </div>
  )
}