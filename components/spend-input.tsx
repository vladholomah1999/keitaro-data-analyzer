"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { saveSpendData } from "@/lib/storage"
import type { SpendData } from "@/lib/types"

interface SpendInputProps {
  creatives: string[]
  onSpendUpdate: (spendData: SpendData) => void
}

export function SpendInput({ creatives, onSpendUpdate }: SpendInputProps) {
  const [spendValues, setSpendValues] = useState<Record<string, string>>({})

  useEffect(() => {
    // Инициализируем пустые значения для всех креативов
    const initialValues: Record<string, string> = {}
    creatives.forEach((creative) => {
      initialValues[creative] = "" // Всегда начинаем с пустых значений
    })

    setSpendValues(initialValues)
  }, [creatives])

  const handleInputChange = (creative: string, value: string) => {
    setSpendValues((prev) => ({
      ...prev,
      [creative]: value,
    }))
  }

  const handleSubmit = () => {
    const spendData: SpendData = {}

    for (const [creative, value] of Object.entries(spendValues)) {
      if (value.trim() !== "") {
        spendData[creative] = Number.parseFloat(value) || 0
      }
    }

    // Save spend data to local storage
    saveSpendData(spendData)

    // Pass spend data to parent component
    onSpendUpdate(spendData)
  }

  // Helper function to extract country code from creative ID
  const getCountryFromCreative = (creative: string): string => {
    const match = creative.match(/[A-Z]{2}$/)
    return match ? match[0] : "Інша"
  }

  // Helper function to extract numeric part from creative ID (e.g., "HO1TZ" -> 1)
  const getNumberFromCreative = (creative: string): number => {
    const match = creative.match(/(\d+)[A-Z]{2}$/)
    return match ? Number.parseInt(match[1], 10) : 0
  }

  // Group creatives by country
  const creativesByCountry: Record<string, string[]> = {}
  creatives.forEach((creative) => {
    const country = getCountryFromCreative(creative)
    if (!creativesByCountry[country]) {
      creativesByCountry[country] = []
    }
    creativesByCountry[country].push(creative)
  })

  // Sort creatives within each country by their numeric part
  Object.keys(creativesByCountry).forEach((country) => {
    creativesByCountry[country].sort((a, b) => {
      return getNumberFromCreative(a) - getNumberFromCreative(b)
    })
  })

  // Sort countries (Tanzania first, then alphabetically)
  const sortedCountries = Object.keys(creativesByCountry).sort((a, b) => {
    if (a === "TZ") return -1
    if (b === "TZ") return 1
    return a.localeCompare(b)
  })

  return (
    <Card className="holmah-card">
      <CardHeader className="holmah-header">
        <CardTitle>Введіть витрати (Spend) для креативів</CardTitle>
        <CardDescription className="text-gray-300">
          Введіть витрати тільки для тих креативів, які хочете бачити в результатах
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {sortedCountries.map((country) => (
            <div key={country} className="space-y-3">
              <h3 className="text-lg font-semibold border-b border-gray-700 pb-2">{country}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {creativesByCountry[country].map((creative) => (
                  <div key={creative} className="flex items-center space-x-3 p-2 rounded-md bg-gray-700">
                    <Label htmlFor={`spend-${creative}`} className="w-1/2 font-medium">
                      {creative}:
                    </Label>
                    <Input
                      id={`spend-${creative}`}
                      type="number"
                      placeholder="0.00"
                      value={spendValues[creative] || ""}
                      onChange={(e) => handleInputChange(creative, e.target.value)}
                      className="w-1/2 holmah-input"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <Button onClick={handleSubmit} className="w-full mt-6 holmah-button">
            Застосувати витрати
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
