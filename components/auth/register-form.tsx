"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

export function RegisterForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
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
    if (!formData.username || !formData.email || !formData.password) {
      setError("Будь ласка, заповніть всі поля")
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Паролі не співпадають")
      setIsLoading(false)
      return
    }

    try {
      // In a real app, you would send this data to your backend
      // For now, we'll just simulate a successful registration
      localStorage.setItem(
        "holmah_user",
        JSON.stringify({
          username: formData.username,
          email: formData.email,
          isLoggedIn: true,
        }),
      )

      // Redirect to dashboard
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } catch (err) {
      setError("Помилка при реєстрації. Спробуйте ще раз.")
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
        <CardTitle className="text-2xl">Реєстрація</CardTitle>
        <CardDescription className="text-blue-100">
          Створіть обліковий запис для доступу до Holmah Аналізатора
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Ім'я користувача</Label>
            <Input
              id="username"
              name="username"
              placeholder="Введіть ім'я користувача"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Підтвердження пароля</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Підтвердіть пароль"
              value={formData.confirmPassword}
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
        <CardFooter className="bg-gray-50 dark:bg-gray-700 p-6 rounded-b-lg">
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Реєстрація...
              </>
            ) : (
              "Зареєструватися"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
