import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return value.toFixed(2) + " $"
}

export function formatPercentage(value: number): string {
  return value.toFixed(1) + " %"
}
