import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { CURRENCY_MAP, getCurrentCurrency, formatCurrency as formatCurrencyUtil } from '@/lib/utils'

interface CurrencyContextType {
  currency: string
  setCurrency: (code: string) => void
  formatCurrency: (usd: number) => string
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'USD',
  setCurrency: () => {},
  formatCurrency: (usd: number) => formatCurrencyUtil(usd, 'USD'),
})

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<string>(() => getCurrentCurrency())

  const setCurrency = useCallback((code: string) => {
    if (!CURRENCY_MAP[code]) return
    setCurrencyState(code)
    try {
      localStorage.setItem('token_tracker_currency', code)
    } catch {}
  }, [])

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'token_tracker_currency' && e.newValue) {
        setCurrencyState(e.newValue)
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const formatCurrency = useCallback((usd: number) => {
    return formatCurrencyUtil(usd, currency)
  }, [currency])

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext)
}
