"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import api from "@/lib/axios-config"

export default function TestAdminRegister() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const registerAdmin = async () => {
    setLoading(true)
    setMessage("")
    
    try {
      const response = await api.post("/auth/register", {
        firstName: "Admin",
        lastName: "User",
        email: "admin@airops.com",
        password: "admin123",
        role: "ADMIN"
      })
      
      setMessage(`Success! Admin user created. Token: ${response.data.token}`)
      console.log("Admin user created:", response.data)
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.message || error.message || "Failed to create admin user"}`)
      console.error("Error creating admin user:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Test Admin Registration</CardTitle>
          <CardDescription>
            Create an admin user to test staff creation functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Email: admin@airops.com</Label>
            </div>
            <div>
              <Label>Password: admin123</Label>
            </div>
            <div>
              <Label>Role: ADMIN</Label>
            </div>
            
            <Button 
              onClick={registerAdmin} 
              disabled={loading}
              className="w-full"
            >
              {loading ? "Creating..." : "Create Admin User"}
            </Button>
            
            {message && (
              <div className={`p-3 rounded ${message.includes("Success") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                {message}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
