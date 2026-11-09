import React, { useMemo } from 'react'
import { motion } from 'motion/react'
import { Gauge, Flame, AlertCircle, ArrowUpRight, Zap } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatNumber } from '@/lib/utils'
import { useCurrency } from '@/context/CurrencyContext'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { springPhysics } from '@/lib/motion'

interface TokenVelocityGaugeProps {
  tokensToday: number
  costToday: number
  hourlyToday?: Array<{ hour: number; tokens: number }>
}

export function TokenVelocityGauge({
  tokensToday,
  costToday,
  hourlyToday = [],
}: TokenVelocityGaugeProps) {
  const { formatCurrency } = useCurrency()

  // Calculate tokens per minute in active periods
  // If hourlyToday has entries, find current hour or peak hour rate
  const { tokensPerMinute, costPerHour, paceTier } = useMemo(() => {
    let recentHourTokens = 0
    if (hourlyToday.length > 0) {
      // Get the latest non-zero hour or current hour
      const nonZero = hourlyToday.filter((h) => h.tokens > 0)
      if (nonZero.length > 0) {
        recentHourTokens = nonZero[nonZero.length - 1].tokens
      } else {
        recentHourTokens = tokensToday / 12 // estimate over 12 daytime hours
      }
    } else {
      recentHourTokens = tokensToday > 0 ? tokensToday / 8 : 0
    }

    const tpm = Math.max(0, Math.round(recentHourTokens / 60))
    const avgCostPerToken = tokensToday > 0 ? costToday / tokensToday : 0.000008
    const cph = (tpm * 60) * avgCostPerToken

    const tier = tpm > 25000 ? {
      label: 'Ultra High Run-Rate',
      color: 'text-rose-400',
      badgeBg: 'bg-rose-500/10 border-rose-500/20 text-rose-300',
      arcColor: '#f43f5e',
      percent: Math.min(100, Math.round((tpm / 35000) * 100)),
      desc: 'Active autonomous agent or batch processing loop detected.',
    } : tpm > 10000 ? {
      label: 'Intensive Loop',
      color: 'text-amber-400',
      badgeBg: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
      arcColor: '#f59e0b',
      percent: Math.min(100, Math.round((tpm / 35000) * 100)),
      desc: 'Continuous multi-file prompt synthesis in progress.',
    } : tpm > 2000 ? {
      label: 'Active Development',
      color: 'text-sky-400',
      badgeBg: 'bg-sky-500/10 border-sky-500/20 text-sky-300',
      arcColor: '#38bdf8',
      percent: Math.min(100, Math.max(15, Math.round((tpm / 35000) * 100))),
      desc: 'Standard interactive pair-programming velocity.',
    } : {
      label: 'Steady / Idling',
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
      arcColor: '#10b981',
      percent: Math.max(6, Math.min(100, Math.round((tpm / 35000) * 100))),
      desc: 'Minimal background polling; token burn is restrained.',
    }

    return {
      tokensPerMinute: tpm,
      costPerHour: cph,
      paceTier: tier,
    }
  }, [tokensToday, costToday, hourlyToday])

  // SVG arc calculation (semicircle)
  const radius = 64
  const strokeWidth = 8
  const circumference = Math.PI * radius
  const strokeDashoffset = circumference - (paceTier.percent / 100) * circumference

  return (
    <Card className="border border-white/10 bg-gradient-to-br from-[#0c0c0c] via-[#080808] to-[#040404] shadow-lg relative overflow-hidden">
      <CardHeader className="p-5 pb-3 border-b border-white/5 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-white">
            <Gauge className="w-4 h-4 text-zinc-300" />
          </div>
          <div>
            <CardTitle className="text-xs font-semibold text-white tracking-wide uppercase font-mono">
              Real-Time Token Velocity
            </CardTitle>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Live run-rate and token consumption frequency
            </p>
          </div>
        </div>

        <div className={`px-2.5 py-1 rounded-full text-[11px] font-mono border ${paceTier.badgeBg} flex items-center gap-1.5`}>
          <Flame className="w-3 h-3" />
          <span>{paceTier.label}</span>
        </div>
      </CardHeader>

      <CardContent className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Radial Speedometer Gauge Arc */}
        <div className="flex flex-col items-center justify-center relative pt-2">
          <div className="relative w-40 h-24 flex items-center justify-center overflow-hidden">
            <svg className="w-40 h-40 transform -rotate-180" viewBox="0 0 160 160">
              {/* Background Arc */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={0}
                strokeLinecap="round"
              />
              {/* Dynamic Value Arc */}
              <motion.circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={paceTier.arcColor}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ type: 'spring', stiffness: 220, damping: 25 }}
              />
            </svg>

            {/* Center Speed readout */}
            <div className="absolute top-10 flex flex-col items-center text-center">
              <span className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
                <AnimatedNumber value={tokensPerMinute} formatter={formatNumber} />
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
                tokens / min
              </span>
            </div>
          </div>

          <div className="flex justify-between w-36 text-[10px] font-mono text-zinc-500 mt-1">
            <span>0</span>
            <span>15k</span>
            <span>35k+</span>
          </div>
        </div>

        {/* Burn Rate Run-Rate Projection */}
        <div className="space-y-3 p-4 rounded-lg bg-white/[0.02] border border-white/5">
          <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Projected Hourly Run-Rate</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tracking-tight tabular-nums">
              {formatCurrency(costPerHour)}
            </span>
            <span className="text-xs text-zinc-400 font-mono">/ hour</span>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed">
            {paceTier.desc}
          </p>
        </div>

        {/* Daily Aggregation Context */}
        <div className="space-y-3 p-4 rounded-lg bg-white/[0.02] border border-white/5">
          <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cumulative Session Burn</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-white tracking-tight tabular-nums">
              <AnimatedNumber value={tokensToday} formatter={formatNumber} />
            </span>
            <span className="text-xs text-zinc-400 font-mono">tokens today</span>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-white/5">
            <span className="text-zinc-500">Today's spend:</span>
            <span className="text-emerald-400 font-medium tabular-nums">{formatCurrency(costToday)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
