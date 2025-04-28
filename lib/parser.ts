import { parse } from "node-html-parser"
import type { KeitaroData } from "./types"
import { getCountryCodeFromCreative, getStandardizedCountryName } from "./country-flags"

export function parseKeitaroData(clicksHtml: string, conversionsHtml: string) {
  // Parse HTML content
  const clicksRoot = parse(clicksHtml)
  const conversionsRoot = parse(conversionsHtml)

  // Extract date from the report
  const dateMatch = clicksHtml.match(/(\d{2}\.\d{4}\.\d{4})|(\d{2}\.\d{2}\.\d{4})|(\d{2}\.\d{2}\.\d{2})/)
  const reportDate = dateMatch ? dateMatch[0] : new Date().toLocaleDateString("uk-UA")

  // Extract data from tables
  const clicksData = extractClicksData(clicksRoot)
  const conversionsData = extractConversionsData(conversionsRoot)

  // Group data by Sub ID 5 (which is the creative ID according to the user)
  const creativeGroups = groupDataByCreative(clicksData, conversionsData)

  // Process data into the final format
  const combinedData: KeitaroData[] = []
  const dates = new Set<string>()
  dates.add(reportDate)

  for (const [creativeId, data] of Object.entries(creativeGroups)) {
    // Skip empty creative IDs
    if (!creativeId) continue

    // Calculate metrics
    const installs = data.clicks
    const reg = data.leads + data.sales // Combine leads and sales for Reg column
    const deposits = data.sales
    const spend = 0 // Default to 0, will be set by user

    // Calculate derived metrics
    const cpaInstall = 0 // Will be calculated after spend is set
    const cpaReg = 0 // Will be calculated after spend is set
    const cpaDep = 0 // Will be calculated after spend is set
    const crReg = installs > 0 ? (reg / installs) * 100 : 0
    const crDep = reg > 0 ? (deposits / reg) * 100 : 0

    // Prioritize country from conversions data
    let country = data.country || ""
    if (!country) {
      const countryFromCreative = getCountryCodeFromCreative(creativeId)
      country = countryFromCreative || "Танзанія" // Default to Tanzania if not found
    }

    // Standardize country name
    const standardizedCountry = getStandardizedCountryName(country)

    combinedData.push({
      creativeId,
      sub1: "holomah", // Default value based on screenshots
      country: standardizedCountry,
      countryFlag: "", // Remove flag
      spend,
      installs,
      reg,
      deposits,
      cpaInstall,
      cpaReg,
      cpaDep,
      crReg,
      crDep,
      date: reportDate,
    })
  }

  // Sort by country and then by creative ID
  combinedData.sort((a, b) => {
    if (a.country !== b.country) {
      // Tanzania first, then others alphabetically
      if (a.country === "Танзанія") return -1
      if (b.country === "Танзанія") return 1
      return a.country.localeCompare(b.country)
    }
    return a.creativeId.localeCompare(b.creativeId)
  })

  return {
    combinedData,
    dates: Array.from(dates),
  }
}

function extractClicksData(root: any) {
  const clicks: Record<string, number> = {}
  const creativeCountry: Record<string, string> = {}

  try {
    // Find the table rows
    const rows = root.querySelectorAll("tr")

    // Find header row to identify column indices
    const headerRow = rows[0]
    if (!headerRow) return { clicks, creativeCountry }

    const headers = headerRow.querySelectorAll("th, td").map((cell: any) => cell.text.trim().toLowerCase())

    // Find indices for important columns
    const sub5Index = headers.findIndex((h: string) => h.includes("sub id 5"))
    const countryIndex = headers.findIndex((h: string) => h.includes("страна") || h.includes("флаг страны"))

    if (sub5Index === -1) return { clicks, creativeCountry }

    // Skip header row
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      const cells = row.querySelectorAll("td")

      // Skip rows with insufficient cells
      if (cells.length <= sub5Index) continue

      // Extract Sub ID 5 (creative ID)
      const creativeId = cells[sub5Index]?.text.trim()

      if (!creativeId) continue

      // Count clicks for this creative
      clicks[creativeId] = (clicks[creativeId] || 0) + 1

      // Extract country if available and not already set
      if (countryIndex !== -1 && cells[countryIndex] && !creativeCountry[creativeId]) {
        creativeCountry[creativeId] = cells[countryIndex].text.trim()
      }
    }
  } catch (error) {
    console.error("Error parsing clicks data:", error)
  }

  return { clicks, creativeCountry }
}

function extractConversionsData(root: any) {
  const leads: Record<string, number> = {}
  const sales: Record<string, number> = {}
  const creativeCountry: Record<string, string> = {}

  try {
    // Find the table rows
    const rows = root.querySelectorAll("tr")

    // Find header row to identify column indices
    const headerRow = rows[0]
    if (!headerRow) return { leads, sales, creativeCountry }

    const headers = headerRow.querySelectorAll("th, td").map((cell: any) => cell.text.trim().toLowerCase())

    // Find indices for important columns
    const sub5Index = headers.findIndex((h: string) => h.includes("sub id 5"))
    const statusIndex = headers.findIndex((h: string) => h.includes("статус"))
    const countryIndex = headers.findIndex((h: string) => h.includes("страна"))

    if (sub5Index === -1 || statusIndex === -1) return { leads, sales, creativeCountry }

    // Skip header row
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      const cells = row.querySelectorAll("td")

      // Skip rows with insufficient cells
      if (cells.length <= Math.max(sub5Index, statusIndex, countryIndex)) continue

      // Extract Sub ID 5 (creative ID)
      const creativeId = cells[sub5Index]?.text.trim()
      if (!creativeId) continue

      // Extract status (lead or sale)
      const status = cells[statusIndex]?.text.trim().toLowerCase()

      // Count leads and sales
      if (status === "lead") {
        leads[creativeId] = (leads[creativeId] || 0) + 1
      } else if (status === "sale") {
        sales[creativeId] = (sales[creativeId] || 0) + 1
      }

      // Extract country from the "СТРАНА" column
      if (countryIndex !== -1 && cells[countryIndex]) {
        const countryValue = cells[countryIndex].text.trim()
        if (countryValue) {
          // Always update the country from conversions data
          creativeCountry[creativeId] = countryValue
        }
      }
    }
  } catch (error) {
    console.error("Error parsing conversions data:", error)
  }

  return { leads, sales, creativeCountry }
}

function groupDataByCreative(clicksData: any, conversionsData: any) {
  const result: Record<
    string,
    {
      clicks: number
      leads: number
      sales: number
      country: string
      spend: number
    }
  > = {}

  // Process clicks data
  for (const [creativeId, count] of Object.entries(clicksData.clicks)) {
    if (!result[creativeId]) {
      result[creativeId] = {
        clicks: 0,
        leads: 0,
        sales: 0,
        country: clicksData.creativeCountry[creativeId] || "",
        spend: 0,
      }
    }
    result[creativeId].clicks = count as number
  }

  // Process conversions data
  for (const [creativeId, count] of Object.entries(conversionsData.leads)) {
    if (!result[creativeId]) {
      result[creativeId] = {
        clicks: 0,
        leads: 0,
        sales: 0,
        country: conversionsData.creativeCountry[creativeId] || "",
        spend: 0,
      }
    }
    result[creativeId].leads = count as number

    // Always use country from conversions data if available
    if (conversionsData.creativeCountry[creativeId]) {
      result[creativeId].country = conversionsData.creativeCountry[creativeId]
    }
  }

  for (const [creativeId, count] of Object.entries(conversionsData.sales)) {
    if (!result[creativeId]) {
      result[creativeId] = {
        clicks: 0,
        leads: 0,
        sales: 0,
        country: conversionsData.creativeCountry[creativeId] || "",
        spend: 0,
      }
    }
    result[creativeId].sales = count as number

    // Always use country from conversions data if available
    if (conversionsData.creativeCountry[creativeId]) {
      result[creativeId].country = conversionsData.creativeCountry[creativeId]
    }
  }

  return result
}
