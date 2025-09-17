"use client"

import { useAuth } from "@/contexts/auth-context"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import api from "@/lib/axios-config"

export default function TestAuthPage() {
  const { user, token, login, logout } = useAuth()
  const [email, setEmail] = useState("admin@airops.com")
  const [password, setPassword] = useState("admin123")
  const [testResult, setTestResult] = useState<string>("")

  const handleLogin = async () => {
    try {
      await login(email, password)
      setTestResult("Login successful!")
    } catch (error) {
      setTestResult(`Login failed: ${error}`)
    }
  }

  const testToken = () => {
    if (!token) {
      setTestResult("No token available")
      return
    }

    try {
      const parts = token.split('.')
      if (parts.length < 2) throw new Error('Invalid JWT format')
      const base64 = parts[1]
      const json = atob(base64)
      const payload = JSON.parse(json)
      const expired = typeof payload.exp === 'number' && Date.now() > payload.exp * 1000
      
      setTestResult(`
Token Analysis:
- Subject: ${payload.sub}
- Issued at: ${payload.iat ? new Date(payload.iat * 1000).toLocaleString() : 'N/A'}
- Expires at: ${payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'N/A'}
- Expired: ${expired ? 'YES' : 'NO'}
- Authorities: ${Array.isArray(payload.authorities) ? payload.authorities.join(', ') : 'None'}
- Token length: ${token.length}
      `)
    } catch (e) {
      setTestResult(`Token parsing error: ${e}`)
    }
  }

  const testStaffAPI = async () => {
    if (!token) {
      setTestResult("No token available for API test")
      return
    }

    try {
      const response = await api.get("/staff/roles")
      setTestResult(`API test successful! Status: ${response.status}, Roles: ${response.data.length}`)
    } catch (error) {
      setTestResult(`API test error: ${error}`)
    }
  }

  const clearStorage = () => {
    localStorage.clear()
    setTestResult("LocalStorage cleared. Refresh the page.")
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Authentication Test Page</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Current Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>User:</strong> {user ? `${user.email} (${user.role})` : 'Not logged in'}</p>
          <p><strong>Token:</strong> {token ? `Available (${token.length} chars)` : 'Missing'}</p>
          <p><strong>Token Preview:</strong> {token ? `${token.substring(0, 50)}...` : 'N/A'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Login Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleLogin}>Login</Button>
            <Button onClick={logout} variant="outline">Logout</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={testToken} variant="secondary">Analyze Token</Button>
            <Button onClick={testStaffAPI} variant="secondary">Test Staff API</Button>
            <Button onClick={clearStorage} variant="destructive">Clear Storage</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded text-sm">
            {testResult || "No test results yet. Run a test above."}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
