"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Calendar, Database, BarChart3, History, Award, LineChart } from "lucide-react"
import { DataTable } from "@/components/data-table"
import { SpendInput } from "@/components/spend-input"
import { DatePicker } from "@/components/date-picker"
import { CompactCalendar } from "@/components/compact-calendar"
import { CreativeHistory } from "@/components/creative-history"
import { BestCreatives } from "@/components/best-creatives"
import { GeoSpendChart } from "@/components/geo-spend-chart"
import { parseKeitaroData } from "@/lib/parser"
import { saveDailyData, getSavedDataForDate, getAllDates, getAllTimeData } from "@/lib/storage"
import type { KeitaroData, SpendData } from "@/lib/types"

export function DataAnalyzer() {
  const [clicksUrl, setClicksUrl] = useState("")
  const [conversionsUrl, setConversionsUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tableData, setTableData] = useState<KeitaroData[]>([])
  const [allTimeData, setAllTimeData] = useState<KeitaroData[]>([])
  const [dateGroups, setDateGroups] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("input")
  const [creatives, setCreatives] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<string>("")

  // Load saved dates on component mount
  useEffect(() => {
    loadSavedData()
  }, [])

  const loadSavedData = () => {
    const savedDates = getAllDates()
    if (savedDates.length > 0) {
      setDateGroups(savedDates)
      setSelectedDate(savedDates[0])

      // Load data for the first date
      const savedData = getSavedDataForDate(savedDates[0])
      setTableData(savedData)

      // Load all time data
      const allTime = getAllTimeData()
      setAllTimeData(allTime)
    }
  }

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
    const savedData = getSavedDataForDate(date)
    setTableData(savedData)
  }

  const handleDataDeleted = () => {
    loadSavedData()
  }

  const handleAnalyze = async () => {
    if (!clicksUrl || !conversionsUrl) {
      setError("Будь ласка, введіть обидва URL-адреси звітів")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Fetch and parse data from both URLs
      const clicksResponse = await fetch("/api/fetch-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: clicksUrl }),
      })

      const conversionsResponse = await fetch("/api/fetch-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: conversionsUrl }),
      })

      if (!clicksResponse.ok || !conversionsResponse.ok) {
        throw new Error("Помилка при отриманні даних зі звітів")
      }

      const clicksData = await clicksResponse.json()
      const conversionsData = await conversionsResponse.json()

      // Process and combine the data
      const { combinedData, dates } = parseKeitaroData(clicksData.html, conversionsData.html)

      // Extract unique creatives for spend input
      const uniqueCreatives = [...new Set(combinedData.map((item) => item.creativeId))]
      setCreatives(uniqueCreatives)

      // Get existing dates
      const existingDates = getAllDates()

      // Update date groups with new dates
      const updatedDates = [...new Set([...existingDates, ...dates])]
      setDateGroups(updatedDates)

      // Set the most recent date as selected
      if (dates.length > 0) {
        setSelectedDate(dates[0])
      }

      setTableData(combinedData)

      // Clear input fields after successful analysis
      setClicksUrl("")
      setConversionsUrl("")

      setActiveTab("spend")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Сталася невідома помилка")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSpendUpdate = (spendData: SpendData) => {
    // Update table data with spend values and filter out creatives with no spend
    const updatedData = tableData
      .map((row) => {
        const spend = spendData[row.creativeId] || 0
        return {
          ...row,
          spend,
          // Recalculate metrics based on new spend
          cpaInstall: row.installs > 0 ? spend / row.installs : 0,
          cpaReg: row.reg > 0 ? spend / row.reg : 0,
          cpaDep: row.deposits > 0 ? spend / row.deposits : 0,
        }
      })
      .filter((row) => row.spend > 0) // Only keep rows with spend > 0

    setTableData(updatedData)

    // Save the data for this date
    saveDailyData(selectedDate, updatedData)

    // Update all time data
    const allTime = getAllTimeData()
    setAllTimeData(allTime)

    // Update date groups
    setDateGroups(getAllDates())

    // Clear creatives list to prepare for new data
    setCreatives([])

    setActiveTab("results")
  }

  return (
    <div className="flex flex-col h-full">
      <div className="holmah-tabs-container">
        <CompactCalendar onDateSelect={handleDateChange} selectedDate={selectedDate} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <div className="holmah-tabs-container">
          <TabsList className="w-full grid grid-cols-7">
            <TabsTrigger value="input" className="holmah-tab flex items-center">
              <Database className="mr-2 h-4 w-4" />
              <span>Дані</span>
            </TabsTrigger>
            <TabsTrigger value="spend" disabled={creatives.length === 0} className="holmah-tab flex items-center">
              <BarChart3 className="mr-2 h-4 w-4" />
              <span>Витрати</span>
            </TabsTrigger>
            <TabsTrigger value="results" disabled={tableData.length === 0} className="holmah-tab flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              <span>За день</span>
            </TabsTrigger>
            <TabsTrigger value="all-time" disabled={allTimeData.length === 0} className="holmah-tab flex items-center">
              <BarChart3 className="mr-2 h-4 w-4" />
              <span>За весь час</span>
            </TabsTrigger>
            <TabsTrigger
              value="creative-history"
              disabled={allTimeData.length === 0}
              className="holmah-tab flex items-center"
            >
              <History className="mr-2 h-4 w-4" />
              <span>Історія</span>
            </TabsTrigger>
            <TabsTrigger
              value="best-creatives"
              disabled={allTimeData.length === 0}
              className="holmah-tab flex items-center"
            >
              <Award className="mr-2 h-4 w-4" />
              <span>Найкращі</span>
            </TabsTrigger>
            <TabsTrigger value="charts" disabled={allTimeData.length === 0} className="holmah-tab flex items-center">
              <LineChart className="mr-2 h-4 w-4" />
              <span>Графіки</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="p-4 flex-grow">
          <TabsContent value="input">
            <Card className="holmah-card">
              <CardHeader className="holmah-header">
                <CardTitle>Завантаження даних</CardTitle>
                <CardDescription className="text-gray-300">
                  Введіть URL-адреси звітів з Keitaro для аналізу
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="clicks-url">URL звіту з кліками</Label>
                    <Input
                      id="clicks-url"
                      placeholder="https://gmblbest.com/exports/report_47_..."
                      value={clicksUrl}
                      onChange={(e) => setClicksUrl(e.target.value)}
                      className="holmah-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="conversions-url">URL звіту з конверсіями</Label>
                    <Input
                      id="conversions-url"
                      placeholder="https://gmblbest.com/exports/report_47_..."
                      value={conversionsUrl}
                      onChange={(e) => setConversionsUrl(e.target.value)}
                      className="holmah-input"
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={handleAnalyze}
                    disabled={isLoading || !clicksUrl || !conversionsUrl}
                    className="holmah-button w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Обробка даних...
                      </>
                    ) : (
                      "Аналізувати дані"
                    )}
                  </Button>

                  {dateGroups.length > 0 && (
                    <div className="mt-8 p-4 bg-gray-700 rounded-md">
                      <h3 className="text-lg font-semibold mb-2">Збережені дані</h3>
                      <p className="mb-4">
                        У вас є збережені дані за {dateGroups.length} {dateGroups.length === 1 ? "день" : "днів"}.
                      </p>
                      <Button onClick={() => setActiveTab("results")} variant="outline" className="w-full rounded-md">
                        Переглянути збережені дані
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="spend">
            {creatives.length > 0 && <SpendInput creatives={creatives} onSpendUpdate={handleSpendUpdate} />}
          </TabsContent>

          <TabsContent value="results">
            {dateGroups.length > 0 && (
              <div className="space-y-6">
                <DatePicker
                  dates={dateGroups}
                  selectedDate={selectedDate}
                  onDateChange={handleDateChange}
                  onDataDeleted={handleDataDeleted}
                />

                {tableData.length > 0 ? (
                  <DataTable data={tableData} date={selectedDate} onDataUpdated={loadSavedData} />
                ) : (
                  <div className="text-center p-8 bg-gray-700 rounded-md">
                    <p>Немає даних для відображення за цю дату.</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all-time">
            {allTimeData.length > 0 ? (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">Показники за весь час</h2>
                <DataTable data={allTimeData} date="Всі дати" onDataUpdated={loadSavedData} />
              </div>
            ) : (
              <div className="text-center p-8 bg-gray-700 rounded-md">
                <p>Немає даних для відображення за весь час.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="creative-history">
            <CreativeHistory />
          </TabsContent>

          <TabsContent value="best-creatives">
            <BestCreatives />
          </TabsContent>

          <TabsContent value="charts">
            <GeoSpendChart data={allTimeData} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
