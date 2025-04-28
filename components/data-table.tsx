"use client"

import React, { useState } from "react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { EditCreativeModal } from "@/components/edit-creative-modal"
import { Edit } from "lucide-react"
import type { KeitaroData } from "@/lib/types"

interface DataTableProps {
  data: KeitaroData[]
  date: string
  onDataUpdated: () => void
}

export function DataTable({ data, date, onDataUpdated }: DataTableProps) {
  const [editingCreative, setEditingCreative] = useState<KeitaroData | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Group data by country
  const dataByCountry: Record<string, KeitaroData[]> = {}

  data.forEach((item) => {
    if (!dataByCountry[item.country]) {
      dataByCountry[item.country] = []
    }
    dataByCountry[item.country].push(item)
  })

  // Sort countries (Tanzania first, then alphabetically)
  const sortedCountries = Object.keys(dataByCountry).sort((a, b) => {
    if (a === "Танзанія") return -1
    if (b === "Танзанія") return 1
    return a.localeCompare(b)
  })

  // Calculate overall totals
  const totalSpend = data.reduce((sum, item) => sum + item.spend, 0)
  const totalInstalls = data.reduce((sum, item) => sum + item.installs, 0)
  const totalReg = data.reduce((sum, item) => sum + item.reg, 0)
  const totalDeposits = data.reduce((sum, item) => sum + item.deposits, 0)

  // Calculate overall metrics
  const overallCpaInstall = totalInstalls > 0 ? totalSpend / totalInstalls : 0
  const overallCpaReg = totalReg > 0 ? totalSpend / totalReg : 0
  const overallCpaDep = totalDeposits > 0 ? totalSpend / totalDeposits : 0
  const overallCrReg = totalInstalls > 0 ? (totalReg / totalInstalls) * 100 : 0
  const overallCrDep = totalReg > 0 ? (totalDeposits / totalReg) * 100 : 0

  const handleEditClick = (creative: KeitaroData) => {
    setEditingCreative(creative)
    setIsEditModalOpen(true)
  }

  const handleEditSave = () => {
    setIsEditModalOpen(false)
    setEditingCreative(null)
    onDataUpdated()
  }

  return (
    <>
      <div className="rounded-md overflow-hidden border border-gray-700 shadow-lg bg-gray-800">
        <Table className="holmah-table">
          <TableHeader>
            <TableRow className="bg-gray-700">
              <TableCell colSpan={3} className="text-center font-bold">
                {date}
              </TableCell>
              <TableCell className="text-right font-bold whitespace-nowrap">{formatCurrency(totalSpend)}</TableCell>
              <TableCell colSpan={8}></TableCell>
            </TableRow>
            <TableRow className="bg-gray-700">
              <TableHead className="font-semibold">Creative_ID</TableHead>
              <TableHead className="font-semibold">Sub1</TableHead>
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
              <TableHead className="font-semibold text-center">Дії</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCountries.map((country) => {
              // Calculate country totals
              const countryData = dataByCountry[country]
              const countrySpend = countryData.reduce((sum, item) => sum + item.spend, 0)
              const countryInstalls = countryData.reduce((sum, item) => sum + item.installs, 0)
              const countryReg = countryData.reduce((sum, item) => sum + item.reg, 0)
              const countryDeposits = countryData.reduce((sum, item) => sum + item.deposits, 0)

              // Calculate country metrics
              const countryCpaInstall = countryInstalls > 0 ? countrySpend / countryInstalls : 0
              const countryCpaReg = countryReg > 0 ? countrySpend / countryReg : 0
              const countryCpaDep = countryDeposits > 0 ? countrySpend / countryDeposits : 0
              const countryCrReg = countryInstalls > 0 ? (countryReg / countryInstalls) * 100 : 0
              const countryCrDep = countryReg > 0 ? (countryDeposits / countryReg) * 100 : 0

              return (
                <React.Fragment key={country}>
                  {/* First show the country name */}
                  <TableRow className="bg-gray-700/50">
                    <TableCell colSpan={3} className="font-bold">
                      {country}
                    </TableCell>
                    <TableCell colSpan={10}></TableCell>
                  </TableRow>

                  {/* Then show all creatives for this country */}
                  {dataByCountry[country].map((row, index) => (
                    <TableRow key={`${country}-${index}`} className="hover:bg-gray-700">
                      <TableCell className="font-medium">{row.creativeId}</TableCell>
                      <TableCell>{row.sub1}</TableCell>
                      <TableCell>{row.country}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">{formatCurrency(row.spend)}</TableCell>
                      <TableCell className="text-right">{row.installs}</TableCell>
                      <TableCell className="text-right">{row.reg}</TableCell>
                      <TableCell className="text-right">{row.deposits}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">{formatCurrency(row.cpaInstall)}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">{formatCurrency(row.cpaReg)}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">{formatCurrency(row.cpaDep)}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">{formatPercentage(row.crReg)}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">{formatPercentage(row.crDep)}</TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-blue-500 hover:text-blue-400 hover:bg-blue-900/30"
                          onClick={() => handleEditClick(row)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Finally show the country totals */}
                  <TableRow className="bg-gray-700/50">
                    <TableCell colSpan={3} className="font-bold text-right">
                      Всього по {country}:
                    </TableCell>
                    <TableCell className="text-right font-medium whitespace-nowrap">
                      {formatCurrency(countrySpend)}
                    </TableCell>
                    <TableCell className="text-right font-medium">{countryInstalls}</TableCell>
                    <TableCell className="text-right font-medium">{countryReg}</TableCell>
                    <TableCell className="text-right font-medium">{countryDeposits}</TableCell>
                    <TableCell className="text-right font-medium whitespace-nowrap">
                      {formatCurrency(countryCpaInstall)}
                    </TableCell>
                    <TableCell className="text-right font-medium whitespace-nowrap">
                      {formatCurrency(countryCpaReg)}
                    </TableCell>
                    <TableCell className="text-right font-medium whitespace-nowrap">
                      {formatCurrency(countryCpaDep)}
                    </TableCell>
                    <TableCell className="text-right font-medium whitespace-nowrap">
                      {formatPercentage(countryCrReg)}
                    </TableCell>
                    <TableCell className="text-right font-medium whitespace-nowrap">
                      {formatPercentage(countryCrDep)}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </React.Fragment>
              )
            })}
            <TableRow className="bg-blue-900/30 font-bold">
              <TableCell colSpan={3}>ЗАГАЛОМ</TableCell>
              <TableCell className="text-right whitespace-nowrap">{formatCurrency(totalSpend)}</TableCell>
              <TableCell className="text-right">{totalInstalls}</TableCell>
              <TableCell className="text-right">{totalReg}</TableCell>
              <TableCell className="text-right">{totalDeposits}</TableCell>
              <TableCell className="text-right whitespace-nowrap">{formatCurrency(overallCpaInstall)}</TableCell>
              <TableCell className="text-right whitespace-nowrap">{formatCurrency(overallCpaReg)}</TableCell>
              <TableCell className="text-right whitespace-nowrap">{formatCurrency(overallCpaDep)}</TableCell>
              <TableCell className="text-right whitespace-nowrap">{formatPercentage(overallCrReg)}</TableCell>
              <TableCell className="text-right whitespace-nowrap">{formatPercentage(overallCrDep)}</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <EditCreativeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        creative={editingCreative}
        date={date}
        onSave={handleEditSave}
      />
    </>
  )
}
