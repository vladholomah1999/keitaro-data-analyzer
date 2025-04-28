"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"
import type { KeitaroData } from "@/lib/types"

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor: string[]
    borderColor: string[]
    borderWidth: number
  }[]
}

interface GeoSpendChartProps {
  data: KeitaroData[]
}

export function GeoSpendChart({ data }: GeoSpendChartProps) {
  const [chartType, setChartType] = useState<string>("spend")
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const chartRef = useRef<any>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const chartInitializedRef = useRef<boolean>(false)

  // Define chart options
  const chartOptions = [
    { value: "spend", label: "Витрати по гео" },
    { value: "installs", label: "Інсталяції по гео" },
    { value: "reg", label: "Реєстрації по гео" },
    { value: "deposits", label: "Депозити по гео" },
    { value: "cpaDep", label: "CPA Dep по гео" },
  ]

  // Prepare chart data
  useEffect(() => {
    if (!data || data.length === 0) return

    // Group data by country
    const countryData: Record<string, { [key: string]: number }> = {}

    data.forEach((item) => {
      if (!countryData[item.country]) {
        countryData[item.country] = {
          spend: 0,
          installs: 0,
          reg: 0,
          deposits: 0,
          cpaDep: 0,
        }
      }

      countryData[item.country].spend += item.spend
      countryData[item.country].installs += item.installs
      countryData[item.country].reg += item.reg
      countryData[item.country].deposits += item.deposits

      // Calculate average CPA Dep for the country
      if (item.deposits > 0) {
        const countryDeposits = countryData[item.country].deposits
        const countrySpend = countryData[item.country].spend
        countryData[item.country].cpaDep = countrySpend / countryDeposits
      }
    })

    // Sort countries by the selected metric
    const sortedCountries = Object.keys(countryData).sort((a, b) => {
      if (chartType === "cpaDep") {
        // For CPA Dep, sort ascending (lower is better)
        return countryData[a][chartType] - countryData[b][chartType]
      }
      // For other metrics, sort descending (higher is better)
      return countryData[b][chartType] - countryData[a][chartType]
    })

    // Prepare chart data
    const labels = sortedCountries
    const values = sortedCountries.map((country) => countryData[country][chartType])

    // Generate colors
    const backgroundColors = sortedCountries.map((_, index) => {
      const hue = (index * 137) % 360 // Golden angle approximation for good color distribution
      return `hsla(${hue}, 70%, 60%, 0.7)`
    })

    const borderColors = backgroundColors.map((color) => color.replace("0.7", "1"))

    const newChartData = {
      labels,
      datasets: [
        {
          label: chartOptions.find((option) => option.value === chartType)?.label || "",
          data: values,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
    }

    setChartData(newChartData)
  }, [chartType, data])

  // Initialize and update chart
  useEffect(() => {
    if (!chartData) return

    const initChart = async () => {
      try {
        // Dynamically import Chart.js
        const { Chart, registerables } = await import("chart.js")

        // Register all components at once
        Chart.register(...registerables)

        // Get canvas context
        if (!canvasRef.current) return
        const ctx = canvasRef.current.getContext("2d")
        if (!ctx) return

        // Destroy previous chart if exists
        if (chartRef.current) {
          chartRef.current.destroy()
        }

        // Create new chart with modern styling
        chartRef.current = new Chart(ctx, {
          type: "bar",
          data: chartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                backgroundColor: "rgba(30, 41, 59, 0.9)",
                titleFont: { size: 13, weight: "bold" },
                bodyFont: { size: 12 },
                padding: 10,
                cornerRadius: 6,
                callbacks: {
                  label: (context) => {
                    let label = context.dataset.label || ""
                    if (label) {
                      label += ": "
                    }
                    if (context.parsed.y !== null) {
                      if (chartType === "spend" || chartType === "cpaDep") {
                        label += formatCurrency(context.parsed.y)
                      } else {
                        label += context.parsed.y
                      }
                    }
                    return label
                  },
                },
              },
            },
            scales: {
              x: {
                grid: {
                  display: false,
                },
                ticks: {
                  font: {
                    size: 10,
                  },
                  maxRotation: 45,
                  minRotation: 45,
                },
              },
              y: {
                beginAtZero: true,
                grid: {
                  color: "rgba(75, 85, 99, 0.2)",
                },
                ticks: {
                  font: {
                    size: 11,
                  },
                  callback: (value) => {
                    if (chartType === "spend" || chartType === "cpaDep") {
                      return formatCurrency(value as number)
                    }
                    return value
                  },
                },
              },
            },
            animation: {
              duration: 500,
              easing: "easeOutQuart",
            },
            layout: {
              padding: {
                top: 10,
                right: 10,
                bottom: 10,
                left: 10,
              },
            },
          },
        })

        chartInitializedRef.current = true
      } catch (error) {
        console.error("Error initializing chart:", error)
      }
    }

    initChart()

    // Cleanup function
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
        chartRef.current = null
      }
    }
  }, [chartData, chartType])

  return (
    <Card className="holmah-card">
      <CardHeader className="holmah-header">
        <CardTitle>Графіки по гео</CardTitle>
        <CardDescription className="text-gray-300">
          Аналіз показників по географічних регіонах за весь час
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Тип графіка:</label>
          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger className="holmah-input">
              <SelectValue placeholder="Виберіть тип графіка" />
            </SelectTrigger>
            <SelectContent>
              {chartOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="h-[300px] relative bg-gray-800/50 rounded-lg p-2 mb-4">
          <canvas ref={canvasRef} id="geoChart"></canvas>
        </div>

        <div className="mt-4">
          <Tabs defaultValue="table">
            <TabsList className="holmah-tabs">
              <TabsTrigger value="table" className="holmah-tab">
                Таблиця
              </TabsTrigger>
              <TabsTrigger value="insights" className="holmah-tab">
                Інсайти
              </TabsTrigger>
            </TabsList>
            <TabsContent value="table" className="mt-4">
              <div className="overflow-x-auto max-h-[200px]">
                <table className="holmah-table">
                  <thead>
                    <tr>
                      <th>Країна</th>
                      <th className="text-right">Витрати</th>
                      <th className="text-right">Інсталяції</th>
                      <th className="text-right">Реєстрації</th>
                      <th className="text-right">Депозити</th>
                      <th className="text-right">CPA Dep</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData?.labels.map((country, index) => {
                      // Find all entries for this country
                      const countryData = data.filter((item) => item.country === country)

                      // Calculate totals
                      const spend = countryData.reduce((sum, item) => sum + item.spend, 0)
                      const installs = countryData.reduce((sum, item) => sum + item.installs, 0)
                      const reg = countryData.reduce((sum, item) => sum + item.reg, 0)
                      const deposits = countryData.reduce((sum, item) => sum + item.deposits, 0)
                      const cpaDep = deposits > 0 ? spend / deposits : 0

                      return (
                        <tr key={country}>
                          <td>{country}</td>
                          <td className="text-right">{formatCurrency(spend)}</td>
                          <td className="text-right">{installs}</td>
                          <td className="text-right">{reg}</td>
                          <td className="text-right">{deposits}</td>
                          <td className="text-right">{formatCurrency(cpaDep)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            <TabsContent value="insights" className="mt-4">
              <div className="bg-gray-700 p-4 rounded-md">
                <h3 className="font-bold mb-2">Аналіз ефективності по гео</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {chartData?.labels.slice(0, 3).map((country, index) => {
                    // Find all entries for this country
                    const countryData = data.filter((item) => item.country === country)

                    // Calculate totals
                    const spend = countryData.reduce((sum, item) => sum + item.spend, 0)
                    const deposits = countryData.reduce((sum, item) => sum + item.deposits, 0)
                    const cpaDep = deposits > 0 ? spend / deposits : 0

                    let insight = ""
                    if (chartType === "spend") {
                      insight = `${country} має найбільші витрати: ${formatCurrency(spend)}`
                    } else if (chartType === "cpaDep") {
                      insight = `${country} має найнижчий CPA Dep: ${formatCurrency(cpaDep)}`
                    } else if (chartType === "deposits") {
                      insight = `${country} має найбільше депозитів: ${deposits}`
                    }

                    return insight ? <li key={country}>{insight}</li> : null
                  })}
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}
