"use client"

import { useAuth } from "@/contexts/auth-context"
import { RegisterForm } from "@/components/auth/register-form"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function RegisterPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  if (user) {
    return null // Will redirect
  }

  return <RegisterForm />
}
