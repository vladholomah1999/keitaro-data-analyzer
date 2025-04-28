"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { getAllTimeData } from "@/lib/storage"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { KeitaroData } from "@/lib/types"

type SortOption = {
  value: keyof KeitaroData | "roi"
  label: string
  formatter: (value: number) => string
  ascending: boolean
}

export function BestCreatives() {
  const [bestCreatives, setBestCreatives] = useState<KeitaroData[]>([])
  const [sortBy, setSortBy] = useState<string>("cpaDep")

  const sortOptions: SortOption[] = [
    { value: "cpaDep", label: "CPA Dep $ (найнижча)", formatter: formatCurrency, ascending: true },
    { value: "cpaReg", label: "CPA Reg $ (найнижча)", formatter: formatCurrency, ascending: true },
    { value: "cpaInstall", label: "CPA Install $ (найнижча)", formatter: formatCurrency, ascending: true },
    { value: "crDep", label: "CR Dep % (найвища)", formatter: formatPercentage, ascending: false },
    { value: "crReg", label: "CR Reg % (найвища)", formatter: formatPercentage, ascending: false },
    { value: "deposits", label: "Deposits (найбільше)", formatter: (val) => val.toString(), ascending: false },
    { value: "reg", label: "Reg (найбільше)", formatter: (val) => val.toString(), ascending: false },
    { value: "installs", label: "Installs (найбільше)", formatter: (val) => val.toString(), ascending: false },
  ]

  useEffect(() => {
    // Get all time data
    const allTimeData = getAllTimeData()

    // Filter creatives with at least one deposit
    const creativesWithDeposits = allTimeData.filter((item) => item.deposits > 0)

    // Find the selected sort option
    const selectedOption = sortOptions.find((option) => option.value === sortBy)

    if (selectedOption) {
      // Sort by the selected metric
      const sortedCreatives = [...creativesWithDeposits].sort((a, b) => {
        const valueA = a[selectedOption.value as keyof KeitaroData] as number
        const valueB = b[selectedOption.value as keyof KeitaroData] as number
        return selectedOption.ascending ? valueA - valueB : valueB - valueA
      })

      setBestCreatives(sortedCreatives)
    }
  }, [sortBy])

  // Find the selected sort option for formatting
  const selectedOption = sortOptions.find((option) => option.value === sortBy)

  return (
    <Card className="holmah-card">
      <CardHeader className="holmah-header">
        <CardTitle>Найкращі креативи</CardTitle>
        <CardDescription className="text-gray-300">
          Креативи відсортовані за обраним параметром ефективності
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Сортувати за:</label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="holmah-input">
              <SelectValue placeholder="Виберіть параметр сортування" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {bestCreatives.length > 0 ? (
          <div className="rounded-md overflow-hidden border border-gray-700">
            <Table className="holmah-table">
              <TableHeader>
                <TableRow className="bg-gray-700">
                  <TableHead className="font-semibold">Ранг</TableHead>
                  <TableHead className="font-semibold">Creative_ID</TableHead>
                  <TableHead className="font-semibold">Country</TableHead>
                  <TableHead className="font-semibold text-right whitespace-nowrap">Spend</TableHead>
                  <TableHead className="font-semibold text-right">Installs</TableHead>
                  <TableHead className="font-semibold text-right">Reg</TableHead>
                  <TableHead className="font-semibold text-right">Deposits</TableHead>
                  <TableHead className="font-semibold text-right whitespace-nowrap">
                    {selectedOption?.label.split(" ")[0]}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bestCreatives.map((creative, index) => (
                  <TableRow key={index} className="hover:bg-gray-700">
                    <TableCell className="font-bold">{index + 1}</TableCell>
                    <TableCell className="font-medium">{creative.creativeId}</TableCell>
                    <TableCell>{creative.country}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">{formatCurrency(creative.spend)}</TableCell>
                    <TableCell className="text-right">{creative.installs}</TableCell>
                    <TableCell className="text-right">{creative.reg}</TableCell>
                    <TableCell className="text-right">{creative.deposits}</TableCell>
                    <TableCell className="text-right whitespace-nowrap font-bold text-blue-400">
                      {selectedOption?.formatter(creative[sortBy as keyof KeitaroData] as number)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center p-8 bg-gray-700 rounded-md">
            <p>Немає даних для відображення. Завантажте дані та введіть витрати для креативів.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
