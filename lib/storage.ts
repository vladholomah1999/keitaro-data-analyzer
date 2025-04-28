import type { DailyData, KeitaroData, SpendData, CreativeHistoryData } from "./types"
import { getStandardizedCountryName } from "./country-flags"

const STORAGE_KEY = "holmah_analyzer_data"
const SPEND_STORAGE_KEY = "holmah_analyzer_spend"

export function saveDailyData(date: string, data: KeitaroData[]): void {
  try {
    // Standardize country names before saving
    const standardizedData = data.map((item) => ({
      ...item,
      country: getStandardizedCountryName(item.country),
    }))

    // Get existing data
    const existingData = getAllSavedData()

    // Find if we already have data for this date
    const existingIndex = existingData.findIndex((item) => item.date === date)

    if (existingIndex >= 0) {
      // Update existing data
      existingData[existingIndex].data = standardizedData
    } else {
      // Add new data
      existingData.push({ date, data: standardizedData })
    }

    // Sort by date (newest first)
    existingData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Save back to storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData))
  } catch (error) {
    console.error("Error saving data:", error)
  }
}

export function deleteDailyData(date: string): boolean {
  try {
    // Get existing data
    const existingData = getAllSavedData()

    // Find if we have data for this date
    const existingIndex = existingData.findIndex((item) => item.date === date)

    if (existingIndex >= 0) {
      // Remove data for this date
      existingData.splice(existingIndex, 1)

      // Save back to storage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData))
      return true
    }
    return false
  } catch (error) {
    console.error("Error deleting data:", error)
    return false
  }
}

export function updateCreativeData(date: string, creativeId: string, updatedData: Partial<KeitaroData>): boolean {
  try {
    // Get existing data
    const existingData = getAllSavedData()

    // Find if we have data for this date
    const dateIndex = existingData.findIndex((item) => item.date === date)

    if (dateIndex >= 0) {
      // Find the creative in the data
      const creativeIndex = existingData[dateIndex].data.findIndex((item) => item.creativeId === creativeId)

      if (creativeIndex >= 0) {
        // Update the creative data
        existingData[dateIndex].data[creativeIndex] = {
          ...existingData[dateIndex].data[creativeIndex],
          ...updatedData,
        }

        // Recalculate derived metrics
        const item = existingData[dateIndex].data[creativeIndex]
        item.cpaInstall = item.installs > 0 ? item.spend / item.installs : 0
        item.cpaReg = item.reg > 0 ? item.spend / item.reg : 0
        item.cpaDep = item.deposits > 0 ? item.spend / item.deposits : 0
        item.crReg = item.installs > 0 ? (item.reg / item.installs) * 100 : 0
        item.crDep = item.reg > 0 ? (item.deposits / item.reg) * 100 : 0

        // Save back to storage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData))
        return true
      }
    }
    return false
  } catch (error) {
    console.error("Error updating creative data:", error)
    return false
  }
}

export function getAllSavedData(): DailyData[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error("Error getting saved data:", error)
    return []
  }
}

export function getSavedDataForDate(date: string): KeitaroData[] {
  try {
    const allData = getAllSavedData()
    const dayData = allData.find((item) => item.date === date)
    return dayData ? dayData.data : []
  } catch (error) {
    console.error("Error getting data for date:", error)
    return []
  }
}

export function getAllDates(): string[] {
  try {
    const allData = getAllSavedData()
    return allData.map((item) => item.date)
  } catch (error) {
    console.error("Error getting all dates:", error)
    return []
  }
}

export function saveSpendData(spendData: SpendData): void {
  try {
    localStorage.setItem(SPEND_STORAGE_KEY, JSON.stringify(spendData))
  } catch (error) {
    console.error("Error saving spend data:", error)
  }
}

export function getSpendData(): SpendData {
  try {
    const data = localStorage.getItem(SPEND_STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  } catch (error) {
    console.error("Error getting spend data:", error)
    return {}
  }
}

export function getAllTimeData(): KeitaroData[] {
  try {
    const allData = getAllSavedData()

    // Group all data by creativeId (ignoring country differences)
    const groupedData: Record<string, KeitaroData> = {}

    allData.forEach((dailyData) => {
      dailyData.data.forEach((item) => {
        const key = item.creativeId

        if (!groupedData[key]) {
          groupedData[key] = {
            ...item,
            installs: 0,
            reg: 0,
            deposits: 0,
            spend: 0,
            date: "Всі дати",
          }
        }

        // Sum up the metrics
        groupedData[key].installs += item.installs
        groupedData[key].reg += item.reg
        groupedData[key].deposits += item.deposits
        groupedData[key].spend += item.spend
      })
    })

    // Recalculate derived metrics
    const result = Object.values(groupedData).map((item) => {
      return {
        ...item,
        cpaInstall: item.installs > 0 ? item.spend / item.installs : 0,
        cpaReg: item.reg > 0 ? item.spend / item.reg : 0,
        cpaDep: item.deposits > 0 ? item.spend / item.deposits : 0,
        crReg: item.installs > 0 ? (item.reg / item.installs) * 100 : 0,
        crDep: item.reg > 0 ? (item.deposits / item.reg) * 100 : 0,
      }
    })

    return result
  } catch (error) {
    console.error("Error calculating all time data:", error)
    return []
  }
}

export function getCreativeHistoryData(creativeId: string): CreativeHistoryData {
  try {
    const allData = getAllSavedData()
    const creativeData: KeitaroData[] = []
    const dates: string[] = []

    allData.forEach((dailyData) => {
      const creativeItems = dailyData.data.filter((item) => item.creativeId === creativeId)

      if (creativeItems.length > 0) {
        creativeData.push(...creativeItems)
        dates.push(dailyData.date)
      }
    })

    return {
      creativeId,
      dates,
      data: creativeData,
    }
  } catch (error) {
    console.error("Error getting creative history data:", error)
    return {
      creativeId,
      dates: [],
      data: [],
    }
  }
}

export function getAllCreativeIds(): string[] {
  try {
    const allData = getAllSavedData()
    const creativeIds = new Set<string>()

    allData.forEach((dailyData) => {
      dailyData.data.forEach((item) => {
        creativeIds.add(item.creativeId)
      })
    })

    return Array.from(creativeIds).sort()
  } catch (error) {
    console.error("Error getting all creative IDs:", error)
    return []
  }
}
