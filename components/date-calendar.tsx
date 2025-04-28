"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllDates } from "@/lib/storage"

interface DateCalendarProps {
  onDateSelect: (date: string) => void
}

export function DateCalendar({ onDateSelect }: DateCalendarProps) {
  const [savedDates, setSavedDates] = useState<Date[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  useEffect(() => {
    // Load all saved dates
    const dates = getAllDates()

    // Convert string dates to Date objects
    const dateObjects = dates.map((dateStr) => {
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

      return new Date() // Fallback
    })

    setSavedDates(dateObjects)
  }, [])

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return

    setSelectedDate(date)

    // Format date to match the format used in storage
    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear()

    const formattedDate = `${day}.${month}.${year}`
    onDateSelect(formattedDate)
  }

  // Function to check if a date has data
  const hasDataForDate = (date: Date) => {
    return savedDates.some(
      (savedDate) =>
        savedDate.getDate() === date.getDate() &&
        savedDate.getMonth() === date.getMonth() &&
        savedDate.getFullYear() === date.getFullYear(),
    )
  }

  return (
    <Card className="icloud-card">
      <CardHeader className="icloud-header">
        <CardTitle>Календар даних</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          className="rounded-md"
          modifiers={{
            hasData: savedDates,
          }}
          modifiersClassNames={{
            hasData: "border-2 border-blue-500 font-bold",
          }}
          components={{
            DayContent: ({ date }) => (
              <div
                className={`w-full h-full flex items-center justify-center ${hasDataForDate(date) ? "text-blue-600 font-bold" : ""}`}
              >
                {date.getDate()}
                {hasDataForDate(date) && <span className="absolute bottom-1 w-1 h-1 bg-blue-500 rounded-full"></span>}
              </div>
            ),
          }}
        />
        <div className="mt-4 text-sm text-center text-gray-500">
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 border-2 border-blue-500 rounded-full"></div>
            <span>Дати з наявними даними</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
