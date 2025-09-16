"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import api from "@/lib/axios-config"

export type UserRole = "ADMIN" | "SUPERVISEUR" | "AGENT"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  isLoading: boolean
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored auth on mount (handle corrupted values gracefully)
    const storedToken = localStorage.getItem("token")
    if (storedToken && storedToken !== "undefined" && storedToken !== "null") {
      setToken(storedToken)
      try {
        ;(api as any).setAuthToken?.(storedToken)
      } catch {}
    } else if (storedToken === "undefined" || storedToken === "null") {
      localStorage.removeItem("token")
    }

    const storedUserRaw = localStorage.getItem("user")
    if (storedUserRaw && storedUserRaw !== "undefined" && storedUserRaw !== "null") {
      try {
        setUser(JSON.parse(storedUserRaw))
      } catch {
        localStorage.removeItem("user")
      }
    } else if (storedUserRaw === "undefined" || storedUserRaw === "null") {
      localStorage.removeItem("user")
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Temporary: bypass gateway due to POST body issue, hit auth-service directly
      const response = await api.post('http://localhost:8090/api/v1/auth/authenticate', { email, password })
      const { token: authToken, user: authUser } = (response as any).data ?? {}

      console.log("Login response:", (response as any).data);
      console.log("User role:", authUser?.role);

      if (!authToken || !authUser) {
        throw new Error('Invalid authentication response')
      }

      setUser(authUser)
      setToken(authToken)
      // Persist for app and axios client
      ;(api as any).setAuthToken?.(authToken)
      localStorage.setItem('token', authToken)
      localStorage.setItem('user', JSON.stringify(authUser))
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterData) => {
    setIsLoading(true)
    try {
      // Temporary: bypass gateway due to POST body issue, hit auth-service directly
      const response = await api.post('http://localhost:8090/api/v1/auth/register', userData)
      const { token: authToken, user: newUser } = (response as any).data ?? {}

      if (!authToken || !newUser) {
        throw new Error('Invalid registration response')
      }

      setToken(authToken)
      setUser(newUser)

      ;(api as any).setAuthToken?.(authToken)
      localStorage.setItem("token", authToken)
      localStorage.setItem("user", JSON.stringify(newUser))
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
