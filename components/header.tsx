"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MountainSnow, LogOut, User, Edit, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getAllTimeData } from "@/lib/storage"
import { formatCurrency } from "@/lib/utils"

export function Header() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [newUsername, setNewUsername] = useState("")
  const [totalSpend, setTotalSpend] = useState(0)

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem("holmah_user")
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setUsername(user.username || "Користувач")
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }

    // Calculate total spend
    const allTimeData = getAllTimeData()
    const total = allTimeData.reduce((sum, item) => sum + item.spend, 0)
    setTotalSpend(total)
  }, [])

  const handleLogout = () => {
    // Update user status in localStorage
    const storedUser = localStorage.getItem("holmah_user")
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        localStorage.setItem(
          "holmah_user",
          JSON.stringify({
            ...user,
            isLoggedIn: false,
          }),
        )
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }

    // Redirect to login page
    router.push("/login")
  }

  const handleEditProfile = () => {
    setNewUsername(username)
    setIsEditModalOpen(true)
  }

  const handleSaveUsername = () => {
    if (newUsername.trim()) {
      // Update username in localStorage
      const storedUser = localStorage.getItem("holmah_user")
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser)
          const updatedUser = {
            ...user,
            username: newUsername.trim(),
          }
          localStorage.setItem("holmah_user", JSON.stringify(updatedUser))
          setUsername(newUsername.trim())
        } catch (error) {
          console.error("Error updating username:", error)
        }
      }
    }
    setIsEditModalOpen(false)
  }

  return (
    <header className="bg-gray-900 py-3 px-4 shadow-md border-b border-gray-800">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MountainSnow size={28} className="text-blue-500" />
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Holmah Аналізатор
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="total-balance">
            <span className="total-balance-label">Загальні витрати:</span>
            <span className="total-balance-amount">{formatCurrency(totalSpend)}</span>
            <Wallet className="ml-2 h-4 w-4 text-blue-400" />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-md bg-gray-800 border-gray-700" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{username}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem onClick={handleEditProfile} className="rounded-md focus:bg-gray-700">
                <Edit className="mr-2 h-4 w-4" />
                <span>Редагувати профіль</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="rounded-md focus:bg-gray-700">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Вийти</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="profile-edit-modal">
          <DialogHeader>
            <DialogTitle>Редагувати профіль</DialogTitle>
          </DialogHeader>
          <div className="profile-edit-form">
            <div className="space-y-2">
              <Label htmlFor="username">Ім'я користувача</Label>
              <Input
                id="username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="holmah-input"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Скасувати
            </Button>
            <Button onClick={handleSaveUsername} className="holmah-button">
              Зберегти
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}
