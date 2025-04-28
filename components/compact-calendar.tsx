"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getAllDates } from "@/lib/storage"

interface CompactCalendarProps {
  onDateSelect: (date: string) => void
  selectedDate?: string
}

export function CompactCalendar({ onDateSelect, selectedDate }: CompactCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isExpanded, setIsExpanded] = useState(false)
  const [savedDates, setSavedDates] = useState<Date[]>([])

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

    // If there's a selected date, set the calendar to that month
    if (selectedDate) {
      const formats = [
        /(\d{2})\.(\d{2})\.(\d{4})/, // DD.MM.YYYY
        /(\d{2})\.(\d{4})\.(\d{4})/, // DD.MMMM.YYYY
        /(\d{2})\.(\d{2})\.(\d{2})/, // DD.MM.YY
      ]

      for (const format of formats) {
        const match = selectedDate.match(format)
        if (match) {
          const day = Number.parseInt(match[1])
          const month = Number.parseInt(match[2]) - 1 // JS months are 0-indexed
          const year = Number.parseInt(match[3])
          setCurrentDate(new Date(year, month, day))
          break
        }
      }
    }
  }, [selectedDate])

  // Function to check if a date has data
  const hasDataForDate = (date: Date) => {
    return savedDates.some(
      (savedDate) =>
        savedDate.getDate() === date.getDate() &&
        savedDate.getMonth() === date.getMonth() &&
        savedDate.getFullYear() === date.getFullYear(),
    )
  }

  // Function to check if a date is the selected date
  const isSelectedDate = (date: Date) => {
    if (!selectedDate) return false

    const formats = [
      /(\d{2})\.(\d{2})\.(\d{4})/, // DD.MM.YYYY
      /(\d{2})\.(\d{4})\.(\d{4})/, // DD.MMMM.YYYY
      /(\d{2})\.(\d{2})\.(\d{2})/, // DD.MM.YY
    ]

    for (const format of formats) {
      const match = selectedDate.match(format)
      if (match) {
        const day = Number.parseInt(match[1])
        const month = Number.parseInt(match[2]) - 1 // JS months are 0-indexed
        const year = Number.parseInt(match[3])

        return date.getDate() === day && date.getMonth() === month && date.getFullYear() === year
      }
    }

    return false
  }

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  // Get day of week (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  // Format date for display in header
  const formatHeaderDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
    }
    return currentDate.toLocaleDateString("uk-UA", options)
  }

  // Format month and year for display
  const formatMonthYear = () => {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      year: "numeric",
    }
    return currentDate.toLocaleDateString("uk-UA", options)
  }

  // Handle month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  // Handle date selection
  const handleDateClick = (day: number) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)

    // Format date to match the format used in storage (DD.MM.YYYY)
    const formattedDate = `${day.toString().padStart(2, "0")}.${(currentDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}.${currentDate.getFullYear()}`

    onDateSelect(formattedDate)
    setIsExpanded(false)
  }

  // Render calendar grid
  const renderCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)

    // Adjust for Monday as first day of week (0 = Monday, 6 = Sunday)
    const firstDayAdjusted = firstDay === 0 ? 6 : firstDay - 1

    const days = []

    // Previous month days
    const prevMonthDays = getDaysInMonth(year, month - 1)
    for (let i = 0; i < firstDayAdjusted; i++) {
      const day = prevMonthDays - firstDayAdjusted + i + 1
      days.push(
        <div key={`prev-${day}`} className="compact-calendar-day compact-calendar-day-other-month">
          {day}
        </div>,
      )
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const hasData = hasDataForDate(date)
      const isSelected = isSelectedDate(date)

      days.push(
        <div
          key={`current-${day}`}
          className={`compact-calendar-day ${hasData ? "compact-calendar-day-has-data" : ""} ${
            isSelected ? "compact-calendar-day-active" : ""
          }`}
          onClick={() => handleDateClick(day)}
        >
          {day}
        </div>,
      )
    }

    // Next month days
    const totalCells = 35 // 5 rows x 7 days
    const remainingCells = totalCells - daysInMonth - firstDayAdjusted
    for (let day = 1; day <= remainingCells; day++) {
      days.push(
        <div key={`next-${day}`} className="compact-calendar-day compact-calendar-day-other-month">
          {day}
        </div>,
      )
    }

    return days
  }

  return (
    <Card className="compact-calendar shadow-lg border-gray-700 bg-gray-800">
      <div className="compact-calendar-header flex items-center justify-between py-1 px-2">
        <div className="text-sm font-medium">{formatHeaderDate()}</div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </Button>
      </div>

      {isExpanded && (
        <div className="p-1">
          <div className="compact-calendar-header flex items-center justify-between py-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={prevMonth}>
              <ChevronLeft size={14} />
            </Button>
            <div className="compact-calendar-month text-xs">{formatMonthYear()}</div>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={nextMonth}>
              <ChevronRight size={14} />
            </Button>
          </div>

          <div className="compact-calendar-grid">
            {/* Weekday headers */}
            {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"].map((day) => (
              <div key={day} className="compact-calendar-weekday">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {renderCalendarDays()}
          </div>
        </div>
      )}
    </Card>
  )
}
