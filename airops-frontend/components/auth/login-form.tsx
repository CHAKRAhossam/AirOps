"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { Plane, Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react"
import Link from "next/link"

interface LoginFormData {
  email: string
  password: string
}

export function LoginForm() {
  const { login, isLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>()

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null)
      await login(data.email, data.password)
    } catch (err) {
      setError("Invalid email or password. Please try again.")
    }
  }

  return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600"></div>
        {/* Pattern overlay removed to avoid JSX parsing issues with embedded quotes */}

  {/* Floating Elements */}
  <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
  <div className="absolute bottom-20 right-10 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-1000"></div>
  <div className="absolute top-1/2 left-20 w-12 h-12 bg-white/10 rounded-full animate-pulse delay-500"></div>

  <div className="relative z-10 w-full max-w-md mx-4">
    <Card className="backdrop-blur-lg bg-white/95 border-0 shadow-2xl">
      <CardHeader className="text-center pb-8">
        {/* Logo with Animation */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full animate-spin-slow opacity-20"></div>
            <div className="relative p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg">
              <Plane className="h-8 w-8 text-white transform rotate-45" />
            </div>
          </div>
        </div>

        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          AirOps
        </CardTitle>
        <CardDescription className="text-gray-600 text-lg">
          Welcome back to your operations center
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800 animate-fade-in">
                <AlertDescription className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  {error}
                </AlertDescription>
              </Alert>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-medium flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              Email Address
            </Label>
            <div className="relative">
              <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  autoComplete="username"
                  className="pl-11 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
              />
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            {errors.email && (
                <p className="text-sm text-red-600 flex items-center gap-1 animate-fade-in">
                  <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                  {errors.email.message}
                </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 font-medium flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" />
              Password
            </Label>
            <div className="relative">
              <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="pl-11 pr-11 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
              />
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
                <p className="text-sm text-red-600 flex items-center gap-1 animate-fade-in">
                  <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                  {errors.password.message}
                </p>
            )}
          </div>

          {/* Sign In Button */}
          <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              disabled={isLoading}
          >
            {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing In...
                </div>
            ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="w-5 h-5" />
                  Sign In
                </div>
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Secure access to your airline operations dashboard
          </p>
          <div className="mt-3">
            <Link href="/register" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Need an account? Register here
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>

  <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
</div>
)
}