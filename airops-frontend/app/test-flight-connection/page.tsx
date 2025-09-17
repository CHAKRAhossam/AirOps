"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { flightService } from "@/lib/flight-service"
import { useToast } from "@/hooks/use-toast"

export default function TestFlightConnectionPage() {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const [testResults, setTestResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const testFlightService = async () => {
    if (!token) {
      toast({
        title: "Error",
        description: "No authentication token available",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setTestResults({})

    try {
      // Test 1: Get flight statuses (public endpoint)
      console.log("Testing flight statuses endpoint...")
      const statuses = await flightService.getAllFlightStatuses()
      setTestResults(prev => ({ ...prev, statuses }))
      console.log("Flight statuses:", statuses)

      // Test 2: Get all flights (protected endpoint)
      console.log("Testing get all flights endpoint...")
      const flights = await flightService.getAllFlights()
      setTestResults(prev => ({ ...prev, flights }))
      console.log("Flights:", flights)

      toast({
        title: "Success",
        description: "Flight service connection test completed successfully!",
      })

    } catch (error) {
      console.error("Flight service test failed:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      setTestResults(prev => ({ ...prev, error: errorMessage }))
      
      toast({
        title: "Error",
        description: `Flight service test failed: ${errorMessage}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-600">Please log in to test the flight service connection.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Flight Service Connection Test</h1>
        <p className="text-gray-600">Test the connection between frontend and flight service</p>
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
              <span className="font-semibold">Token Length:</span> {token ? token.length : 0}
            </div>
          </div>
          
          <Button 
            onClick={testFlightService} 
            disabled={loading || !token}
            className="w-full"
          >
            {loading ? "Testing..." : "Test Flight Service Connection"}
          </Button>
        </CardContent>
      </Card>

      {Object.keys(testResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>What This Test Does</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>1. <strong>Authentication:</strong> Sets the JWT token in the flight service</p>
          <p>2. <strong>Public Endpoint:</strong> Tests the flight statuses endpoint (no auth required)</p>
          <p>3. <strong>Protected Endpoint:</strong> Tests the get all flights endpoint (auth required)</p>
          <p>4. <strong>Results:</strong> Shows the response data or any errors</p>
        </CardContent>
      </Card>
    </div>
  )
}
