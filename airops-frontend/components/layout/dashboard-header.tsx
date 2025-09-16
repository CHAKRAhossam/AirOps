"use client"

import { useAuth } from "@/contexts/auth-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { usePathname, useRouter } from "next/navigation"
import {
  Bell,
  Search,
  Settings,
  User,
  LogOut,
  Shield,
  Users,
  Plane,
  X,
  ChevronDown
} from "lucide-react"
import { useState } from "react"

interface DashboardHeaderProps {
  onSearch?: (query: string) => void
  notifications?: Array<{
    id: string
    title: string
    message: string
    time: string
    read: boolean
  }>
}

export function DashboardHeader({
                                  onSearch,
                                  notifications = []
                                }: DashboardHeaderProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  if (!user) return null

  const unreadCount = notifications.filter(n => !n.read).length

  const getPageInfo = () => {
    const currentPath = pathname

    switch (currentPath) {
      case "/dashboard":
        return {
          title: "Dashboard",
          subtitle: getDashboardSubtitle(user.role),
          icon: <Plane className="h-6 w-6 text-blue-600" />
        }
      case "/flights":
        return {
          title: "Flight Management",
          subtitle: "Manage flight schedules and operations",
          icon: <Plane className="h-6 w-6 text-blue-600" />
        }
      case "/staff":
        return {
          title: "Staff Management",
          subtitle: "Manage crew members and staff assignments",
          icon: <Users className="h-6 w-6 text-green-600" />
        }
      case "/chat":
        return {
          title: "Real-time Chat",
          subtitle: "Communicate with your team in real-time",
          icon: <Users className="h-6 w-6 text-purple-600" />
        }
      case "/reports":
        return {
          title: "Reports & Analytics",
          subtitle: "Comprehensive performance metrics and insights",
          icon: <Shield className="h-6 w-6 text-orange-600" />
        }
      case "/schedule":
        return {
          title: "Schedule Management",
          subtitle: "Manage and coordinate schedules",
          icon: <Plane className="h-6 w-6 text-indigo-600" />
        }
      case "/admin":
        return {
          title: "System Administration",
          subtitle: "System configuration and management",
          icon: <Shield className="h-6 w-6 text-red-600" />
        }
      case "/settings":
        return {
          title: "Settings",
          subtitle: "Configure your preferences",
          icon: <Settings className="h-6 w-6 text-gray-600" />
        }
      default:
        return {
          title: "Dashboard",
          subtitle: "Welcome to AirOps",
          icon: <Plane className="h-6 w-6 text-blue-600" />
        }
    }
  }

  const getDashboardSubtitle = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "System overview and administration"
      case "SUPERVISEUR":
        return "Flight operations and staff management"
      case "AGENT":
        return "Flight information and staff directory"
      default:
        return "Welcome to AirOps"
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
      case "SUPERVISEUR":
        return "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
      case "AGENT":
        return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim())
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const { title, subtitle, icon } = getPageInfo()

  return (
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Page Info */}
            <div className="flex items-center space-x-3">
              {icon}
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                  {title}
                </h1>
                {subtitle && (
                    <p className="text-sm text-gray-600 mt-0.5 hidden sm:block">
                      {subtitle}
                    </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Search */}
              <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      aria-label="Search"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <form onSubmit={handleSearch} className="flex">
                    <Input
                        placeholder="Search flights, staff, reports..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border-0 focus-visible:ring-0 rounded-r-none"
                        autoFocus
                    />
                    <Button type="submit" size="sm" className="rounded-l-none">
                      <Search className="h-4 w-4" />
                    </Button>
                  </form>
                  {searchQuery && (
                      <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-12 top-2"
                          onClick={() => {
                            setSearchQuery("")
                            setSearchOpen(false)
                          }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                  )}
                </PopoverContent>
              </Popover>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 relative"
                      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-medium">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="px-3 py-2 border-b">
                    <h3 className="font-medium text-gray-900">Notifications</h3>
                  </div>
                  {notifications.length > 0 ? (
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.slice(0, 5).map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={`flex flex-col items-start p-3 cursor-pointer ${
                                    !notification.read ? "bg-blue-50" : ""
                                }`}
                            >
                              <div className="flex items-start justify-between w-full">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {notification.message}
                                  </p>
                                </div>
                                {!notification.read && (
                                    <div className="ml-2 mt-1 h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mt-2">
                                {notification.time}
                              </p>
                            </DropdownMenuItem>
                        ))}
                        {notifications.length > 5 && (
                            <DropdownMenuItem className="text-center text-blue-600 hover:text-blue-700">
                              View all notifications
                            </DropdownMenuItem>
                        )}
                      </div>
                  ) : (
                      <div className="px-3 py-6 text-center text-gray-500 text-sm">
                        No notifications
                      </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center space-x-2 cursor-pointer">
                    <Badge
                        variant="outline"
                        className={`transition-colors ${getRoleBadgeColor(user.role)}`}
                    >
                      {user.role}
                    </Badge>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 flex items-center space-x-2 px-2"
                    >
                      <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div className="hidden sm:block text-left">
                        <p className="text-sm font-medium text-gray-900">
                          {user.name || user.email}
                        </p>
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2 border-b">
                    <p className="text-sm font-medium text-gray-900">
                      {user.name || user.email}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
  );
}