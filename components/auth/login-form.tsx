"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

export function LoginForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // Validate form
    if (!formData.email || !formData.password) {
      setError("Будь ласка, заповніть всі поля")
      setIsLoading(false)
      return
    }

    try {
      // In a real app, you would validate credentials against your backend
      // For now, we'll just check if the user exists in localStorage
      const storedUser = localStorage.getItem("holmah_user")

      if (storedUser) {
        const user = JSON.parse(storedUser)

        // In a real app, you would properly validate the password
        // Here we're just checking if the email matches
        if (user.email === formData.email) {
          // Update user status
          localStorage.setItem(
            "holmah_user",
            JSON.stringify({
              ...user,
              isLoggedIn: true,
            }),
          )

          // Redirect to dashboard
          setTimeout(() => {
            router.push("/dashboard")
          }, 1000)
          return
        }
      }

      // If we get here, authentication failed
      setError("Невірний email або пароль")
      setIsLoading(false)
    } catch (err) {
      setError("Помилка при вході. Спробуйте ще раз.")
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
        <CardTitle className="text-2xl">Вхід</CardTitle>
        <CardDescription className="text-blue-100">
          Увійдіть до свого облікового запису Holmah Аналізатора
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Введіть email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Введіть пароль"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="bg-gray-50 dark:bg-gray-700 p-6 flex flex-col space-y-4 rounded-b-lg">
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Вхід...
              </>
            ) : (
              "Увійти"
            )}
          </Button>
          <div className="text-center text-sm">
            Немає облікового запису?{" "}
            <Link href="/register" className="text-blue-600 hover:underline">
              Зареєструватися
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
