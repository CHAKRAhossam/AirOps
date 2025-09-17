"use client"

import { useAuth, type UserRole } from "@/contexts/auth-context"
import { LoginForm } from "./login-form"
import { Shield, ShieldAlert, Plane } from "lucide-react"
import type { ReactNode } from "react"

interface ProtectedRouteProps {
  children: ReactNode
  requiredRoles?: UserRole[]
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>

    {/* Loading Content */}
    <div className="relative z-10 text-center">
      {/* Animated Logo */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse opacity-50"></div>
          <div className="relative p-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-2xl">
            <Plane className="h-12 w-12 text-white transform rotate-45 animate-bounce" />
          </div>
        </div>
      </div>

      {/* Loading Spinner */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-blue-400 rounded-full animate-spin-reverse"></div>
        </div>
      </div>

      {/* Loading Text */}
      <h2 className="text-2xl font-bold text-white mb-4">Loading AirOps</h2>
      <p className="text-blue-200 text-lg mb-8">Initializing your aviation dashboard...</p>

      {/* Loading Progress Dots */}
      <div className="flex justify-center space-x-2">
        <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-150"></div>
        <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-300"></div>
      </div>
    </div>

    <style jsx>{`
          @keyframes spin-reverse {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }
          
          .animate-spin-reverse {
            animation: spin-reverse 1.5s linear infinite;
          }
        `}</style>
  </div>
  )
  }

  if (!user) {
    return <LoginForm />
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M30 15l15 15-15 15-15-15z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>

    {/* Floating Warning Elements */}
    <div className="absolute top-20 left-10 w-20 h-20 bg-red-500/20 rounded-full animate-pulse"></div>
    <div className="absolute bottom-20 right-10 w-16 h-16 bg-orange-500/20 rounded-full animate-pulse delay-1000"></div>

    <div className="relative z-10 max-w-md mx-4">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 text-center border border-red-200">
        {/* Warning Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
            <div className="relative p-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-full shadow-lg">
              <ShieldAlert className="h-10 w-10 text-white animate-pulse" />
            </div>
          </div>
        </div>

        {/* Access Denied Content */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6 text-lg">
          You don't have the required permissions to access this area of the system.
        </p>

        {/* User Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700">Current Role:</span>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {user.role}
              </span>
        </div>

        {/* Required Roles */}
        {requiredRoles && (
            <div className="bg-red-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <span className="font-medium text-red-700">Required Role(s):</span>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {requiredRoles.map((role) => (
                    <span
                        key={role}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"
                    >
                      {role}
                    </span>
                ))}
              </div>
            </div>
        )}

        {/* Contact Info */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">
            Contact your system administrator to request access.
          </p>
          <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg"
          >
            Go Back
          </button>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm">
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
          Access Restricted
        </div>
      </div>
    </div>
  </div>
  )
  }

  return <>{children}</>
}