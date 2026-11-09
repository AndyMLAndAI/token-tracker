import React from 'react'
import { motion } from 'motion/react'
import { Zap, ShieldCheck, TrendingUp, Sparkles, ArrowDownRight, Layers } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatNumber } from '@/lib/utils'
import { useCurrency } from '@/context/CurrencyContext'

interface PromptCacheAnalyticsProps {
  inputTokens: number
  outputTokens: number
  cacheReadTokens: number
  cacheCreationTokens: number
  totalCost: number
}

export function PromptCacheAnalytics({
  inputTokens,
  outputTokens,
  cacheReadTokens,
  cacheCreationTokens,
  totalCost,
}: PromptCacheAnalyticsProps) {
  const { formatCurrency } = useCurrency()

  const totalInputContext = inputTokens + cacheReadTokens + cacheCreationTokens
  const cacheHitRatio = totalInputContext > 0 ? (cacheReadTokens / totalInputContext) * 100 : 0

  // Standard Anthropic prompt cache pricing discount:
  // Base input: ~$3.00 / M tokens (Sonnet benchmark)
  // Cache read: ~$0.30 / M tokens (90% discount)
  // Approximate savings per cache read token: $2.70 / 1,000,000
  const estimatedSavingsUsd = (cacheReadTokens * 2.70) / 1_000_000
  const hypotheticalFullCost = totalCost + estimatedSavingsUsd

  const efficiencyTier = cacheHitRatio >= 85 ? {
    grade: 'A+',
    label: 'Optimal Cache Reuse',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  } : cacheHitRatio >= 60 ? {
    grade: 'A',
    label: 'High Cache Efficiency',
    color: 'text-teal-400',
    bg: 'bg-teal-500/10 border-teal-500/20',
  } : cacheHitRatio >= 30 ? {
    grade: 'B',
    label: 'Moderate Reuse',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  } : {
    grade: 'C',
    label: 'Initial Warmup',
    color: 'text-zinc-400',
    bg: 'bg-zinc-500/10 border-zinc-500/20',
  }

  return (
    <Card className="border border-white/10 bg-gradient-to-br from-[#0c0c0c] via-[#090909] to-[#040404] shadow-xl overflow-hidden relative">
      {/* Ambient background light */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.03] rounded-full blur-3xl pointer-events-none" />

      <CardHeader className="pb-3 border-b border-white/[0.06] flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-medium text-white tracking-tight">
              Prompt Cache Efficiency & Net Savings
            </CardTitle>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Anthropic & OpenAI context caching telemetry vs standard prompt compute
            </p>
          </div>
        </div>

        <div className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-medium border flex items-center gap-1.5 ${efficiencyTier.bg} ${efficiencyTier.color}`}>
          <Sparkles className="w-3 h-3" />
          <span>{efficiencyTier.grade} · {efficiencyTier.label}</span>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-5">
        {/* Main highlight metric grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Estimated Financial Savings */}
          <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-1">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
              <span>Financial Savings</span>
              <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono tracking-tight text-emerald-400 tabular-nums">
              {formatCurrency(estimatedSavingsUsd)}
            </div>
            <div className="text-[10px] text-zinc-500 font-mono">
              vs un-cached input compute
            </div>
          </div>

          {/* Cache Hit Ratio */}
          <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-1">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
              <span>Context Cache Hit Rate</span>
              <span className="text-[10px] text-zinc-500">{formatNumber(cacheReadTokens)} tokens</span>
            </div>
            <div className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
              {cacheHitRatio.toFixed(1)}%
            </div>
            <div className="text-[10px] text-zinc-500 font-mono">
              of total prompt input volume
            </div>
          </div>

          {/* Net Compute vs Without Cache */}
          <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-1">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
              <span>Effective Spend</span>
              <span className="text-[10px] text-zinc-500 line-through tabular-nums">
                {formatCurrency(hypotheticalFullCost)}
              </span>
            </div>
            <div className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
              {formatCurrency(totalCost)}
            </div>
            <div className="text-[10px] text-emerald-400/90 font-mono">
              {hypotheticalFullCost > 0 ? `${((estimatedSavingsUsd / hypotheticalFullCost) * 100).toFixed(0)}% budget discount` : '0% discount'}
            </div>
          </div>
        </div>

        {/* Visual Prompt Distribution Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Input Context Partitioning</span>
            <span className="text-[11px] text-zinc-500">{formatNumber(totalInputContext)} total context tokens</span>
          </div>

          <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden flex p-0.5 gap-0.5">
            {/* Cache Read (Emerald) */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${cacheHitRatio}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-emerald-500 rounded-full"
              title={`Cache Read: ${cacheHitRatio.toFixed(1)}%`}
            />
            {/* Standard Input (White) */}
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${totalInputContext > 0 ? (inputTokens / totalInputContext) * 100 : 0}%`,
              }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="h-full bg-zinc-400 rounded-full"
              title="Standard Prompt Tokens"
            />
            {/* Cache Creation (Purple) */}
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${totalInputContext > 0 ? (cacheCreationTokens / totalInputContext) * 100 : 0}%`,
              }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="h-full bg-purple-400 rounded-full"
              title="Cache Write / Creation"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-zinc-400 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Cache Read ({formatNumber(cacheReadTokens)})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-zinc-400" />
              <span>Standard Input ({formatNumber(inputTokens)})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>Cache Creation ({formatNumber(cacheCreationTokens)})</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
