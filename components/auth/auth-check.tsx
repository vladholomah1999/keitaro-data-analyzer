"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface AuthCheckProps {
  children: React.ReactNode
}

export function AuthCheck({ children }: AuthCheckProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("holmah_user")

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        if (user.isLoggedIn) {
          setIsAuthenticated(true)
          setIsLoading(false)
          return
        }
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }

    // If we get here, user is not authenticated
    setIsLoading(false)
    router.push("/login")
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg">Перевірка автентифікації...</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
