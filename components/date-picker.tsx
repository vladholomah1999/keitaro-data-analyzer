"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Calendar, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteDailyData } from "@/lib/storage"

interface DatePickerProps {
  dates: string[]
  selectedDate: string
  onDateChange: (date: string) => void
  onDataDeleted: () => void
}

export function DatePicker({ dates, selectedDate, onDateChange, onDataDeleted }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [dateToDelete, setDateToDelete] = useState("")

  // Find the index of the current selected date
  const currentIndex = dates.indexOf(selectedDate)

  // Sort dates in descending order (newest first)
  const sortedDates = [...dates].sort((a, b) => {
    // Convert to Date objects for proper comparison
    const dateA = parseDate(a)
    const dateB = parseDate(b)
    return dateB.getTime() - dateA.getTime()
  })

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onDateChange(dates[currentIndex - 1])
    }
  }

  const handleNext = () => {
    if (currentIndex < dates.length - 1) {
      onDateChange(dates[currentIndex + 1])
    }
  }

  const handleDeleteClick = (date: string) => {
    setDateToDelete(date)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (dateToDelete) {
      const success = deleteDailyData(dateToDelete)
      if (success) {
        // Close the date picker dropdown
        setIsOpen(false)
        // Notify parent component that data was deleted
        onDataDeleted()
      }
    }
    setIsDeleteDialogOpen(false)
  }

  // Helper function to parse date strings in various formats
  function parseDate(dateStr: string): Date {
    // Try different date formats
    const formats = [
      /(\d{2})\.(\d{2})\.(\d{4})/, // DD.MM.YYYY
      /(\d{2})\.(\d{4})\.(\d{4})/, // DD.MMMM.YYYY
      /(\d{2})\.(\d{2})\.(\d{2})/, // DD.MM.YY
    ]

    for (const format of formats) {
      const match = dateStr.match(format)
      if (match) {
        const day = Number.parseInt(match[1])
        const month = Number.parseInt(match[2]) - 1 // JS months are 0-indexed
        const year = Number.parseInt(match[3])
        return new Date(year, month, day)
      }
    }

    // Fallback to current date if parsing fails
    return new Date()
  }

  return (
    <Card className="holmah-card">
      <CardHeader className="holmah-header">
        <CardTitle className="text-center">Вибір дати</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            disabled={currentIndex <= 0}
            className="rounded-md"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button variant="outline" className="flex-1 mx-2 rounded-md" onClick={() => setIsOpen(!isOpen)}>
            <Calendar className="h-4 w-4 mr-2" />
            {selectedDate}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={currentIndex >= dates.length - 1}
            className="rounded-md"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {isOpen && (
          <div className="mt-4">
            <div className="text-sm font-medium mb-2">Доступні дати ({sortedDates.length}):</div>
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
              {sortedDates.map((date) => (
                <div key={date} className="flex items-center">
                  <Button
                    variant={date === selectedDate ? "default" : "outline"}
                    className={`${date === selectedDate ? "bg-blue-600" : ""} flex-1 justify-start rounded-md`}
                    onClick={() => {
                      onDateChange(date)
                      setIsOpen(false)
                    }}
                  >
                    {date}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2 text-red-500 hover:text-red-400 hover:bg-red-900/30 rounded-md"
                    onClick={() => handleDeleteClick(date)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Видалити дані за {dateToDelete}?</AlertDialogTitle>
              <AlertDialogDescription>
                Ця дія не може бути скасована. Всі дані за цю дату будуть видалені назавжди.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Скасувати</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Видалити
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
