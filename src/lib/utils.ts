import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + 'B'
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M'
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'k'
  }
  return num.toLocaleString()
}

// Approximate reference exchange rates relative to USD.
// Note: Rates are static approximations for cost estimation and are not live forex feeds.
export const CURRENCY_MAP: Record<string, { symbol: string; rate: number; label: string }> = {
  USD: { symbol: '$', rate: 1.0, label: 'USD ($)' },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR (€ approx.)' },
  GBP: { symbol: '£', rate: 0.79, label: 'GBP (£ approx.)' },
  JPY: { symbol: '¥', rate: 155.0, label: 'JPY (¥ approx.)' },
  CAD: { symbol: 'CA$', rate: 1.36, label: 'CAD ($ approx.)' },
  AUD: { symbol: 'A$', rate: 1.52, label: 'AUD ($ approx.)' },
}

export function getCurrentCurrency(): string {
  try {
    return localStorage.getItem('token_tracker_currency') || 'USD'
  } catch {
    return 'USD'
  }
}

export function formatCurrency(usd: number, customCurrency?: string): string {
  const code = customCurrency || getCurrentCurrency()
  const info = CURRENCY_MAP[code] || CURRENCY_MAP.USD
  const converted = usd * info.rate
  if (converted === 0) return `${info.symbol}0.00`
  if (converted < 0.01) return `< ${info.symbol}0.01`
  if (code === 'JPY') {
    return `${info.symbol}${Math.round(converted).toLocaleString()}`
  }
  return `${info.symbol}${converted.toFixed(2)}`
}

export function formatDate(timestamp: number): string {
  const d = new Date(timestamp)
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(timestamp)
}
