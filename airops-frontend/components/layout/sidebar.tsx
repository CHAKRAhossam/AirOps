"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth, type UserRole } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter, usePathname } from "next/navigation"
import {
  Plane,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  Home,
  Calendar,
  Shield,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut,
  TestTube,
  Bell,
  HelpCircle,
  Moon,
  Sun,
  Wifi,
  WifiOff,
  Activity,
} from "lucide-react"

interface SidebarProps {}

interface MenuItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  roles: UserRole[]
  href: string
  badge?: string
  isNew?: boolean
}

const menuItems: MenuItem[] = [
  { id: "dashboard", label: "Dashboard", icon: Home, roles: ["ADMIN", "SUPERVISEUR", "AGENT"], href: "/dashboard" },
  { id: "flights", label: "Flight Management", icon: Plane, roles: ["ADMIN", "SUPERVISEUR", "AGENT"], href: "/flights", badge: "Live" },
  { id: "staff", label: "Staff Management", icon: Users, roles: ["ADMIN", "SUPERVISEUR"], href: "/staff" },
  { id: "chat", label: "Real-time Chat", icon: MessageSquare, roles: ["ADMIN", "SUPERVISEUR", "AGENT"], href: "/chat", badge: "3" },
  { id: "reports", label: "Reports & Analytics", icon: BarChart3, roles: ["ADMIN", "SUPERVISEUR"], href: "/reports" },
  { id: "schedule", label: "Schedule Management", icon: Calendar, roles: ["ADMIN", "SUPERVISEUR"], href: "/schedule" },
  // Removed test and admin entries from sidebar
  { id: "settings", label: "Settings", icon: Settings, roles: ["ADMIN", "SUPERVISEUR", "AGENT"], href: "/settings" },
]

export function Sidebar({}: SidebarProps) {
  const { user, logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Simulate network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!user) return null

  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(user.role))

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  const getActiveModule = () => {
    const currentPath = pathname
    const menuItem = menuItems.find(item => item.href === currentPath)
    return menuItem ? menuItem.id : "dashboard"
  }

  const activeModule = getActiveModule()

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'from-red-500 to-red-600'
      case 'SUPERVISEUR':
        return 'from-blue-500 to-blue-600'
      case 'AGENT':
        return 'from-green-500 to-green-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'SUPERVISEUR':
        return 'Supervisor'
      default:
        return role
    }
  }

  return (
      <div
          className={`bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 border-r border-gray-700/50 transition-all duration-300 ease-in-out ${
              isCollapsed ? "w-20" : "w-72"
          } flex flex-col h-full shadow-2xl relative overflow-hidden`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.3) 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)`
          }}></div>
        </div>

        {/* Header */}
        <div className="relative z-10 p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <Plane className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">AirOps</h1>
                    <p className="text-xs text-blue-300">Operations Center</p>
                  </div>
                </div>
            )}
            {isCollapsed && (
                <div className="mx-auto">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <Plane className="h-6 w-6 text-white" />
                  </div>
                </div>
            )}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* User Info */}
        <div className="relative z-10 p-6 border-b border-gray-700/50">
          {!isCollapsed ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 bg-gradient-to-br ${getRoleColor(user.role)} rounded-xl shadow-lg`}>
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge
                      className={`bg-gradient-to-r ${getRoleColor(user.role)} text-white border-0 shadow-lg px-3 py-1`}
                  >
                    {getRoleDisplayName(user.role)}
                  </Badge>

                  <div className="flex items-center space-x-2">
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
                        isOnline ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                      <span className="text-xs">{isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                  </div>
                </div>
              </div>
          ) : (
              <div className="flex flex-col items-center space-y-3">
                <div className={`p-2 bg-gradient-to-br ${getRoleColor(user.role)} rounded-lg shadow-lg`}>
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
              </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 relative z-10 overflow-y-auto custom-scrollbar">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeModule === item.id

            return (
                <div key={item.id} className="relative">
                  <Button
                      variant="ghost"
                      className={`w-full transition-all duration-200 ease-in-out ${
                          isCollapsed ? "px-3 py-3" : "px-4 py-3"
                      } ${
                          isActive
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                              : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                      } ${
                          isCollapsed ? "justify-center" : "justify-start"
                      } relative group rounded-xl`}
                      onClick={() => handleNavigation(item.href)}
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                  >
                    <Icon className={`h-5 w-5 ${isCollapsed ? "" : "mr-4"} ${
                        isActive ? "text-white" : ""
                    }`} />
                    {!isCollapsed && (
                        <>
                          <span className="font-medium">{item.label}</span>
                          <div className="ml-auto flex items-center space-x-2">
                            {item.badge && (
                                <Badge
                                    className={`px-2 py-0.5 text-xs ${
                                        item.badge === '!'
                                            ? 'bg-red-500 text-white'
                                            : item.badge === 'Live'
                                                ? 'bg-green-500 text-white animate-pulse'
                                                : 'bg-blue-500 text-white'
                                    } border-0`}
                                >
                                  {item.badge}
                                </Badge>
                            )}
                            {item.isNew && (
                                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
                            )}
                          </div>
                        </>
                    )}

                    {/* Active indicator */}
                    {isActive && (
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg"></div>
                    )}
                  </Button>

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && hoveredItem === item.id && (
                      <div className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2 z-50">
                        <div className="bg-gray-800 text-white px-3 py-2 rounded-lg shadow-xl border border-gray-600 whitespace-nowrap">
                          <div className="text-sm font-medium">{item.label}</div>
                          {item.badge && (
                              <div className="text-xs text-gray-300 mt-1">
                                {item.badge === '!' ? 'Attention needed' :
                                    item.badge === 'Live' ? 'Real-time data' :
                                        `${item.badge} notifications`}
                              </div>
                          )}
                          {/* Arrow */}
                          <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-800 border-l border-b border-gray-600 rotate-45"></div>
                        </div>
                      </div>
                  )}
                </div>
            )
          })}

          {/* Section Divider */}
          <div className="my-6">
            <div className="border-t border-gray-700/50"></div>
          </div>

          {/* Quick Actions */}
          {!isCollapsed && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">Quick Actions</p>

                <Button
                    variant="ghost"
                    className="w-full justify-start px-4 py-3 text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-xl transition-all duration-200"
                >
                  <Bell className="h-5 w-5 mr-4" />
                  <span className="font-medium">Notifications</span>
                  <Badge className="ml-auto bg-red-500 text-white border-0 px-2 py-0.5 text-xs">
                    5
                  </Badge>
                </Button>

                <Button
                    variant="ghost"
                    className="w-full justify-start px-4 py-3 text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-xl transition-all duration-200"
                >
                  <HelpCircle className="h-5 w-5 mr-4" />
                  <span className="font-medium">Help & Support</span>
                </Button>
              </div>
          )}
        </nav>

        {/* System Status */}
        {!isCollapsed && (
            <div className="relative z-10 p-4 border-t border-gray-700/50">
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-400">System Status</span>
                  <Activity className="h-4 w-4 text-green-400 animate-pulse" />
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-4 bg-green-400 rounded-full"></div>
                    <div className="w-2 h-3 bg-green-400 rounded-full"></div>
                    <div className="w-2 h-5 bg-green-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <div className="w-2 h-4 bg-green-400 rounded-full"></div>
                  </div>
                  <span className="text-xs text-green-400 font-medium">All systems operational</span>
                </div>
              </div>
            </div>
        )}

        {/* Bottom Actions */}
        <div className="relative z-10 p-4 border-t border-gray-700/50 space-y-2">
          <Button
              variant="ghost"
              className={`w-full transition-all duration-200 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-xl ${
                  isCollapsed ? "px-3 py-3 justify-center" : "px-4 py-3 justify-start"
              }`}
              onClick={logout}
          >
            <LogOut className={`h-5 w-5 ${isCollapsed ? "" : "mr-4"}`} />
            {!isCollapsed && <span className="font-medium">Sign Out</span>}
          </Button>
        </div>

        <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(75, 85, 99, 0.1);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.5);
        }
      `}</style>
      </div>
  )
}