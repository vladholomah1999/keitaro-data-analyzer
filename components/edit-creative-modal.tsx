"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { updateCreativeData } from "@/lib/storage"
import type { KeitaroData } from "@/lib/types"

interface EditCreativeModalProps {
  isOpen: boolean
  onClose: () => void
  creative: KeitaroData | null
  date: string
  onSave: () => void
}

export function EditCreativeModal({ isOpen, onClose, creative, date, onSave }: EditCreativeModalProps) {
  const [formData, setFormData] = useState<Partial<KeitaroData>>({
    spend: 0,
    installs: 0,
    reg: 0,
    deposits: 0,
  })

  // Initialize form data when creative changes
  useEffect(() => {
    if (creative) {
      setFormData({
        spend: creative.spend,
        installs: creative.installs,
        reg: creative.reg,
        deposits: creative.deposits,
      })
    }
  }, [creative])

  const handleChange = (field: keyof KeitaroData, value: string) => {
    const numValue = Number.parseFloat(value) || 0
    setFormData((prev) => ({
      ...prev,
      [field]: numValue,
    }))
  }

  const handleSubmit = () => {
    if (creative) {
      const success = updateCreativeData(date, creative.creativeId, formData)
      if (success) {
        onSave()
      }
    }
    onClose()
  }

  if (!creative) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-md bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle>Редагувати креатив: {creative.creativeId}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Змініть значення для креативу за {date}. Натисніть Зберегти, коли закінчите.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="spend" className="text-right">
              Spend
            </Label>
            <Input
              id="spend"
              type="number"
              step="0.01"
              value={formData.spend}
              onChange={(e) => handleChange("spend", e.target.value)}
              className="col-span-3 holmah-input"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="installs" className="text-right">
              Installs
            </Label>
            <Input
              id="installs"
              type="number"
              value={formData.installs}
              onChange={(e) => handleChange("installs", e.target.value)}
              className="col-span-3 holmah-input"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reg" className="text-right">
              Reg
            </Label>
            <Input
              id="reg"
              type="number"
              value={formData.reg}
              onChange={(e) => handleChange("reg", e.target.value)}
              className="col-span-3 holmah-input"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="deposits" className="text-right">
              Deposits
            </Label>
            <Input
              id="deposits"
              type="number"
              value={formData.deposits}
              onChange={(e) => handleChange("deposits", e.target.value)}
              className="col-span-3 holmah-input"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-md">
            Скасувати
          </Button>
          <Button onClick={handleSubmit} className="holmah-button">
            Зберегти
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
