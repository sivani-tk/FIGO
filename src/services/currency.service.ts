// ============================================================
// FIGO — Currency Service
// Supports: ExchangeRate-API (key optional), with static fallback
// ============================================================
import axios from 'axios'
import type { Currency, CurrencyRates } from '@/types'

const API_KEY = import.meta.env.VITE_EXCHANGE_RATE_API_KEY

// Static fallback rates relative to INR (approximate)
const FALLBACK_RATES: Record<Currency, number> = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  AED: 0.044,
  JPY: 1.78,
  GBP: 0.0095,
  CAD: 0.016,
  AUD: 0.019,
}

let cachedRates: CurrencyRates | null = null

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  INR: '₹', USD: '$', EUR: '€', AED: 'د.إ', JPY: '¥', GBP: '£', CAD: 'CA$', AUD: 'A$',
}

export const CURRENCIES: Currency[] = ['INR', 'USD', 'EUR', 'AED', 'JPY', 'GBP', 'CAD', 'AUD']

export async function getRates(): Promise<CurrencyRates> {
  if (cachedRates) return cachedRates

  if (API_KEY) {
    try {
      const { data } = await axios.get(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/INR`, { timeout: 6000 })
      const rates: Record<Currency, number> = {} as Record<Currency, number>
      CURRENCIES.forEach((c) => { rates[c] = data.conversion_rates[c] ?? FALLBACK_RATES[c] })
      cachedRates = { base: 'INR', rates, updatedAt: new Date().toISOString() }
      setTimeout(() => { cachedRates = null }, 3_600_000) // cache 1h
      return cachedRates
    } catch { /* fallthrough */ }
  }

  cachedRates = { base: 'INR', rates: FALLBACK_RATES, updatedAt: new Date().toISOString() }
  setTimeout(() => { cachedRates = null }, 3_600_000)
  return cachedRates
}

export function convertAmount(amountInr: number, toCurrency: Currency, rates?: Record<Currency, number>): number {
  const r = rates ?? FALLBACK_RATES
  return amountInr * (r[toCurrency] ?? 1)
}

export function formatCurrency(amount: number, currency: Currency, rates?: Record<Currency, number>): string {
  const converted = convertAmount(amount, currency, rates)
  const symbol = CURRENCY_SYMBOLS[currency]

  if (currency === 'INR') return formatINR(converted)
  if (currency === 'JPY') return `${symbol}${Math.round(converted).toLocaleString()}`

  return `${symbol}${converted.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

// Indian number formatting (lakhs, crores)
export function formatINR(amount: number): string {
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(2)} Cr`
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(2)} L`
  if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(1)}K`
  return `₹${Math.round(amount).toLocaleString('en-IN')}`
}

export function getBudgetCategory(amountInr: number): { label: string; color: string; emoji: string } {
  if (amountInr < 10_000) return { label: 'Budget Traveller', color: '#22c55e', emoji: '🎒' }
  if (amountInr < 50_000) return { label: 'Comfort Traveller', color: '#3b82f6', emoji: '🧳' }
  if (amountInr < 200_000) return { label: 'Luxury Traveller', color: '#a855f7', emoji: '✈️' }
  return { label: 'Ultra Luxury Traveller', color: '#f59e0b', emoji: '💎' }
}
