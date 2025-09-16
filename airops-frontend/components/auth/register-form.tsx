"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth, type UserRole } from "@/contexts/auth-context"
import { Plane, Eye, EyeOff, Mail, Lock, User, UserCheck, Shield, Briefcase } from "lucide-react"
import Link from "next/link"

interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  role: UserRole
}

export function RegisterForm() {
  const { register: registerUser, isLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<UserRole>("AGENT")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>()

  const password = watch("password")

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null)
      await registerUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: selectedRole,
      })
    } catch (err) {
      setError("Registration failed. Please try again.")
    }
  }

  return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-8">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-blue-500 to-purple-600"></div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 right-20 w-16 h-16 bg-white/10 rounded-full animate-pulse"></div>

        <div className="relative z-10 w-full max-w-2xl mx-4">
          <Card className="backdrop-blur-lg bg-white/95 border-0 shadow-2xl">
            <CardHeader className="text-center pb-6">
              {/* Logo with Animation */}
          <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full opacity-20"></div>
                  <div className="relative p-4 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full shadow-lg">
                    <Plane className="h-8 w-8 text-white transform rotate-45" />
                  </div>
            </div>
          </div>

              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Join AirOps
              </CardTitle>
              <CardDescription className="text-gray-600 text-lg">
                Create your airline operations account
              </CardDescription>
        </CardHeader>

            <CardContent className="space-y-5">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
                      <AlertDescription className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        {error}
                      </AlertDescription>
              </Alert>
            )}

                {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-700 font-medium flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-600" />
                      First Name
                    </Label>
                    <div className="relative">
                <Input
                  id="firstName"
                  placeholder="John"
                          className="pl-11 h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
                  {...register("firstName", { required: "First name is required" })}
                />
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    {errors.firstName && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                          {errors.firstName.message}
                        </p>
                    )}
              </div>

              <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-700 font-medium flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-600" />
                      Last Name
                    </Label>
                    <div className="relative">
                <Input
                  id="lastName"
                  placeholder="Doe"
                          className="pl-11 h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
                  {...register("lastName", { required: "Last name is required" })}
                />
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    {errors.lastName && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                          {errors.lastName.message}
                        </p>
                    )}
              </div>
            </div>

                {/* Email Field */}
            <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    Email Address
                  </Label>
                  <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="john.doe@airline.com"
                        autoComplete="email"
                        className="pl-11 h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
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
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                        {errors.email.message}
                      </p>
                  )}
            </div>

                {/* Compact Role Selection */}
            <div className="space-y-2">
                  <Label htmlFor="role" className="text-gray-700 font-medium flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    Role
                  </Label>

                  {/* Horizontal Role Cards */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        value: 'AGENT',
                        icon: User,
                        title: 'Agent',
                        bgColor: 'bg-blue-50',
                        borderColor: 'border-blue-200',
                        selectedBorder: 'border-blue-500',
                        selectedBg: 'bg-blue-100',
                        iconColor: 'text-blue-600'
                      },
                      {
                        value: 'SUPERVISEUR',
                        icon: UserCheck,
                        title: 'Supervisor',
                        bgColor: 'bg-green-50',
                        borderColor: 'border-green-200',
                        selectedBorder: 'border-green-500',
                        selectedBg: 'bg-green-100',
                        iconColor: 'text-green-600'
                      },
                      {
                        value: 'ADMIN',
                        icon: Shield,
                        title: 'Admin',
                        bgColor: 'bg-purple-50',
                        borderColor: 'border-purple-200',
                        selectedBorder: 'border-purple-500',
                        selectedBg: 'bg-purple-100',
                        iconColor: 'text-purple-600'
                      }
                    ].map((role) => {
                      const Icon = role.icon;
                      const isSelected = selectedRole === role.value;

                      return (
                          <div
                              key={role.value}
                              onClick={() => setSelectedRole(role.value as UserRole)}
                              className={`
                          relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-sm text-center
                          ${isSelected
                                  ? `${role.selectedBorder} ${role.selectedBg} shadow-sm`
                                  : `${role.borderColor} ${role.bgColor} hover:${role.borderColor}`
                              }
                        `}
                          >
                            {/* Selected Indicator */}
                            {isSelected && (
                                <div className="absolute -top-1 -right-1">
                                  <div className={`w-3 h-3 rounded-full ${role.iconColor.replace('text-', 'bg-')} border-2 border-white`}></div>
                                </div>
                            )}

                            {/* Icon */}
                            <div className="mx-auto mb-2">
                              <Icon className={`
                              w-6 h-6 transition-all duration-200 mx-auto
                              ${isSelected ? role.iconColor : 'text-gray-400'}
                            `} />
                            </div>

                            {/* Title */}
                            <p className={`
                            text-sm font-medium transition-all duration-200
                            ${isSelected ? 'text-gray-900' : 'text-gray-600'}
                          `}>
                              {role.title}
                            </p>
                          </div>
                      );
                    })}
                  </div>

                  {/* Hidden Select for Form Validation */}
              <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
                    <SelectTrigger className="sr-only">
                      <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AGENT">Agent</SelectItem>
                  <SelectItem value="SUPERVISEUR">Supervisor</SelectItem>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-600" />
                      Password
                    </Label>
                    <div className="relative">
              <Input
                id="password"
                          type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                          autoComplete="new-password"
                          className="pl-11 pr-11 h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
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
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                          {errors.password.message}
                        </p>
                    )}
            </div>

            <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-700 font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-600" />
                      Confirm Password
                    </Label>
                    <div className="relative">
              <Input
                id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                          autoComplete="new-password"
                          className="pl-11 pr-11 h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) => value === password || "Passwords do not match",
                })}
              />
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                          {errors.confirmPassword.message}
                        </p>
                    )}
                  </div>
            </div>

                {/* Create Account Button */}
                <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 mt-6"
                    disabled={isLoading}
                >
                  {isLoading ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating Account...
                      </div>
                  ) : (
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-5 h-5" />
                        Create Account
                      </div>
                  )}
            </Button>
          </form>

              {/* Footer */}
              <div className="text-center pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  Join thousands of aviation professionals worldwide
                </p>
                <div className="mt-3">
                  <Link href="/login" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                    Already have an account? Sign in
                  </Link>
                </div>
              </div>
        </CardContent>
      </Card>
        </div>
    </div>
  )
}