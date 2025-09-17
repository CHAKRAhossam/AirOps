"use client"

import { useAuth } from "@/contexts/auth-context"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { reportingService, ReportFilters } from "@/lib/reporting-service"
import { RefreshCw, Download, FileText, BarChart3, Users, Plane } from "lucide-react"

export default function TestReportingPage() {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<any>({})
  const [selectedPeriod, setSelectedPeriod] = useState("6months")

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-600">Please log in to test the reporting service connection.</p>
        </div>
      </div>
    )
  }

  const testFlightReports = async () => {
    try {
      setLoading(true)
      const filters: ReportFilters = { period: selectedPeriod }
      const flightReport = await reportingService.getFlightReports(filters)
      
      setTestResults(prev => ({ ...prev, flightReport }))
      toast({
        title: "Success",
        description: "Flight reports loaded successfully!",
      })
    } catch (error) {
      console.error('Flight reports test failed:', error)
      toast({
        title: "Error",
        description: `Flight reports test failed: ${error}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const testStaffReports = async () => {
    try {
      setLoading(true)
      const filters: ReportFilters = { period: selectedPeriod }
      const staffReport = await reportingService.getStaffReports(filters)
      
      setTestResults(prev => ({ ...prev, staffReport }))
      toast({
        title: "Success",
        description: "Staff reports loaded successfully!",
      })
    } catch (error) {
      console.error('Staff reports test failed:', error)
      toast({
        title: "Error",
        description: `Staff reports test failed: ${error}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const testDashboardData = async () => {
    try {
      setLoading(true)
      const filters: ReportFilters = { period: selectedPeriod }
      const dashboardData = await reportingService.getDashboardData(filters)
      
      setTestResults(prev => ({ ...prev, dashboardData }))
      toast({
        title: "Success",
        description: "Dashboard data loaded successfully!",
      })
    } catch (error) {
      console.error('Dashboard data test failed:', error)
      toast({
        title: "Error",
        description: `Dashboard data test failed: ${error}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const testRealTimeMetrics = async () => {
    try {
      setLoading(true)
      const metrics = await reportingService.getRealTimeMetrics()
      
      setTestResults(prev => ({ ...prev, realTimeMetrics: metrics }))
      toast({
        title: "Success",
        description: "Real-time metrics loaded successfully!",
      })
    } catch (error) {
      console.error('Real-time metrics test failed:', error)
      toast({
        title: "Error",
        description: `Real-time metrics test failed: ${error}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const testPerformanceTrends = async () => {
    try {
      setLoading(true)
      const trends = await reportingService.getPerformanceTrends(selectedPeriod)
      
      setTestResults(prev => ({ ...prev, performanceTrends: trends }))
      toast({
        title: "Success",
        description: "Performance trends loaded successfully!",
      })
    } catch (error) {
      console.error('Performance trends test failed:', error)
      toast({
        title: "Error",
        description: `Performance trends test failed: ${error}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const testExport = async (format: 'pdf' | 'excel') => {
    try {
      setLoading(true)
      const filters: ReportFilters = { period: selectedPeriod }
      const exportResponse = await reportingService.exportReport('dashboard', format, filters)
      
      setTestResults(prev => ({ ...prev, exportResponse }))
      toast({
        title: "Export Info",
        description: exportResponse.message,
      })
    } catch (error) {
      console.error('Export test failed:', error)
      toast({
        title: "Error",
        description: `Export test failed: ${error}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const runAllTests = async () => {
    setLoading(true)
    try {
      await Promise.all([
        testFlightReports(),
        testStaffReports(),
        testDashboardData(),
        testRealTimeMetrics(),
        testPerformanceTrends()
      ])
      
      toast({
        title: "Success",
        description: "All tests completed successfully!",
      })
    } catch (error) {
      console.error('Some tests failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Reporting Service Connection Test</h1>
        <p className="text-gray-600">Test the connection between frontend and reporting service</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">User:</span> {user.firstName} {user.lastName}
            </div>
            <div>
              <span className="font-semibold">Role:</span> {user.role}
            </div>
            <div>
              <span className="font-semibold">Token Available:</span> {token ? "Yes" : "No"}
            </div>
            <div>
              <span className="font-semibold">Selected Period:</span> {selectedPeriod}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
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
              onClick={runAllTests} 
              disabled={loading || !token}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? "Running Tests..." : "Run All Tests"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Flight Reports Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plane className="h-5 w-5 text-blue-600" />
              <span>Flight Reports</span>
            </CardTitle>
            <CardDescription>Test flight statistics and analytics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testFlightReports} 
              disabled={loading || !token}
              variant="outline"
              className="w-full"
            >
              Test Flight Reports
            </Button>
            {testResults.flightReport && (
              <div className="text-sm text-green-600">
                ✓ Loaded {testResults.flightReport.totalFlights} flights
              </div>
            )}
          </CardContent>
        </Card>

        {/* Staff Reports Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <span>Staff Reports</span>
            </CardTitle>
            <CardDescription>Test staff performance data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testStaffReports} 
              disabled={loading || !token}
              variant="outline"
              className="w-full"
            >
              Test Staff Reports
            </Button>
            {testResults.staffReport && (
              <div className="text-sm text-green-600">
                ✓ Loaded {testResults.staffReport.totalElements} staff members
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dashboard Data Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <span>Dashboard Data</span>
            </CardTitle>
            <CardDescription>Test comprehensive dashboard data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testDashboardData} 
              disabled={loading || !token}
              variant="outline"
              className="w-full"
            >
              Test Dashboard Data
            </Button>
            {testResults.dashboardData && (
              <div className="text-sm text-green-600">
                ✓ Dashboard data loaded successfully
              </div>
            )}
          </CardContent>
        </Card>

        {/* Real-time Metrics Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5 text-orange-600" />
              <span>Real-time Metrics</span>
            </CardTitle>
            <CardDescription>Test live operational metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testRealTimeMetrics} 
              disabled={loading || !token}
              variant="outline"
              className="w-full"
            >
              Test Real-time Metrics
            </Button>
            {testResults.realTimeMetrics && (
              <div className="text-sm text-green-600">
                ✓ Metrics updated at {new Date(testResults.realTimeMetrics.lastUpdated).toLocaleTimeString()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Trends Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              <span>Performance Trends</span>
            </CardTitle>
            <CardDescription>Test historical performance data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testPerformanceTrends} 
              disabled={loading || !token}
              variant="outline"
              className="w-full"
            >
              Test Performance Trends
            </Button>
            {testResults.performanceTrends && (
              <div className="text-sm text-green-600">
                ✓ Trends data loaded successfully
              </div>
            )}
          </CardContent>
        </Card>

        {/* Export Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-red-600" />
              <span>Export Test</span>
            </CardTitle>
            <CardDescription>Test report export functionality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Button 
                onClick={() => testExport('pdf')} 
                disabled={loading || !token}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <FileText className="h-4 w-4 mr-1" />
                PDF
              </Button>
              <Button 
                onClick={() => testExport('excel')} 
                disabled={loading || !token}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-1" />
                Excel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Detailed results from all tests</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm max-h-96">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
