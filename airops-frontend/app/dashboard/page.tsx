"use client"

import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "@/components/layout/sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { SupervisorDashboard } from "@/components/dashboard/supervisor-dashboard"
import { AgentDashboard } from "@/components/dashboard/agent-dashboard"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/login")
    } else {
      // Simulate initial loading for smooth transition
      setTimeout(() => setIsLoading(false), 800)
    }
  }, [user, router])

  if (!user || isLoading) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 mx-auto mb-6">
                <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Loading Dashboard</h2>
            <p className="text-gray-600">Preparing your personalized experience...</p>
            <div className="mt-6 flex justify-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
    )
  }

  const renderDashboard = () => {
    switch (user.role) {
      case "ADMIN":
        return <AdminDashboard />
      case "SUPERVISEUR":
        return <SupervisorDashboard />
      case "AGENT":
        return <AgentDashboard />
      default:
        return <AgentDashboard />
    }
  }

  const getDashboardTitle = () => {
    switch (user.role) {
      case "ADMIN":
        return "System Administration"
      case "SUPERVISEUR":
        return "Operations Management"
      case "AGENT":
        return "Flight Operations"
      default:
        return "Dashboard"
    }
  }

  const getDashboardDescription = () => {
    switch (user.role) {
      case "ADMIN":
        return "Monitor system health, user management, and platform metrics"
      case "SUPERVISEUR":
        return "Oversee flight operations, staff assignments, and performance metrics"
      case "AGENT":
        return "Access flight information, staff directory, and operational tools"
      default:
        return "Your personalized workspace"
    }
  }

  return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-hidden">
        {/* Enhanced Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Backdrop */}
        <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-300" id="mobile-sidebar-backdrop">
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Enhanced Header */}
          <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-30">
            <DashboardHeader />

            {/* Dashboard Title Section */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{getDashboardTitle()}</h1>
                  <p className="text-gray-600 text-sm mt-1">{getDashboardDescription()}</p>
                </div>
                <div className="flex items-center space-x-3">
                  {/* Role Badge */}
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.role === 'ADMIN' ? 'bg-red-100 text-red-700 border border-red-200' :
                          user.role === 'SUPERVISEUR' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                              'bg-green-100 text-green-700 border border-green-200'
                  }`}>
                    {user.role === 'SUPERVISEUR' ? 'Supervisor' : user.role}
                  </div>
                  {/* Status Indicator */}
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-600">Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-blue-50">
            <div className="min-h-full">
              <div className="animate-fade-in">
                {renderDashboard()}
              </div>
            </div>
          </main>

          {/* Enhanced Footer */}
          <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200/50 px-6 py-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span>© 2024 Flight Management System</span>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <span>Version 2.1.0</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>System Status: Operational</span>
                </div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <span>Last Updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
  )
}