import type { TimeWindow } from '@/types'

export function formatTimeWindow(tw: TimeWindow): string {
  return `${tw.start}–${tw.end}`
}

export function formatLimit(value: number | null, unit: string): string {
  if (value === null) return '無限制'
  return `${value} ${unit}`
}
