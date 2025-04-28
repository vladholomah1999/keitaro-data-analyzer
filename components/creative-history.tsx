"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { getAllCreativeIds, getCreativeHistoryData } from "@/lib/storage"
import type { KeitaroData } from "@/lib/types"

export function CreativeHistory() {
  const [creativeIds, setCreativeIds] = useState<string[]>([])
  const [selectedCreative, setSelectedCreative] = useState<string>("")
  const [historyData, setHistoryData] = useState<KeitaroData[]>([])

  useEffect(() => {
    // Load all creative IDs
    const ids = getAllCreativeIds()
    setCreativeIds(ids)

    // Set the first creative as selected if available
    if (ids.length > 0) {
      setSelectedCreative(ids[0])
    }
  }, [])

  useEffect(() => {
    if (selectedCreative) {
      // Load history data for the selected creative
      const { data } = getCreativeHistoryData(selectedCreative)
      setHistoryData(data)
    }
  }, [selectedCreative])

  // Calculate totals
  const totalSpend = historyData.reduce((sum, item) => sum + item.spend, 0)
  const totalInstalls = historyData.reduce((sum, item) => sum + item.installs, 0)
  const totalReg = historyData.reduce((sum, item) => sum + item.reg, 0)
  const totalDeposits = historyData.reduce((sum, item) => sum + item.deposits, 0)

  // Calculate overall metrics
  const overallCpaInstall = totalInstalls > 0 ? totalSpend / totalInstalls : 0
  const overallCpaReg = totalReg > 0 ? totalSpend / totalReg : 0
  const overallCpaDep = totalDeposits > 0 ? totalSpend / totalDeposits : 0
  const overallCrReg = totalInstalls > 0 ? (totalReg / totalInstalls) * 100 : 0
  const overallCrDep = totalReg > 0 ? (totalDeposits / totalReg) * 100 : 0

  return (
    <Card className="holmah-card">
      <CardHeader className="holmah-header">
        <CardTitle>Історія креативу</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Виберіть креатив:</label>
            <Select value={selectedCreative} onValueChange={setSelectedCreative}>
              <SelectTrigger className="holmah-input">
                <SelectValue placeholder="Виберіть креатив" />
              </SelectTrigger>
              <SelectContent>
                {creativeIds.map((id) => (
                  <SelectItem key={id} value={id}>
                    {id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {historyData.length > 0 ? (
            <div className="rounded-md overflow-hidden border border-gray-700">
              <Table className="holmah-table">
                <TableHeader>
                  <TableRow className="bg-gray-700">
                    <TableCell colSpan={12} className="text-center font-bold">
                      Історія креативу: {selectedCreative}
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-gray-700">
                    <TableHead className="font-semibold">Дата</TableHead>
                    <TableHead className="font-semibold">Country</TableHead>
                    <TableHead className="font-semibold text-right whitespace-nowrap">Spend</TableHead>
                    <TableHead className="font-semibold text-right">Installs</TableHead>
                    <TableHead className="font-semibold text-right">Reg</TableHead>
                    <TableHead className="font-semibold text-right">Deposits</TableHead>
                    <TableHead className="font-semibold text-right whitespace-nowrap">CPA Install $</TableHead>
                    <TableHead className="font-semibold text-right whitespace-nowrap">CPA Reg $</TableHead>
                    <TableHead className="font-semibold text-right whitespace-nowrap">CPA Dep $</TableHead>
                    <TableHead className="font-semibold text-right whitespace-nowrap">CR Reg %</TableHead>
                    <TableHead className="font-semibold text-right whitespace-nowrap">CR Dep %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyData.map((item, index) => (
                    <TableRow key={index} className="hover:bg-gray-700">
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.country}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">{formatCurrency(item.spend)}</TableCell>
                      <TableCell className="text-right">{item.installs}</TableCell>
                      <TableCell className="text-right">{item.reg}</TableCell>
                      <TableCell className="text-right">{item.deposits}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">{formatCurrency(item.cpaInstall)}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">{formatCurrency(item.cpaReg)}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">{formatCurrency(item.cpaDep)}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">{formatPercentage(item.crReg)}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">{formatPercentage(item.crDep)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-blue-900/30 font-bold">
                    <TableCell colSpan={2}>ЗАГАЛОМ</TableCell>
                    <TableCell className="text-right whitespace-nowrap">{formatCurrency(totalSpend)}</TableCell>
                    <TableCell className="text-right">{totalInstalls}</TableCell>
                    <TableCell className="text-right">{totalReg}</TableCell>
                    <TableCell className="text-right">{totalDeposits}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">{formatCurrency(overallCpaInstall)}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">{formatCurrency(overallCpaReg)}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">{formatCurrency(overallCpaDep)}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">{formatPercentage(overallCrReg)}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">{formatPercentage(overallCrDep)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center p-8 bg-gray-700 rounded-md">
              <p>Немає даних для відображення для цього креативу.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
