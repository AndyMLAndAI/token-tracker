import React, { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { Calculator, ArrowRightLeft, Sparkles, Check, ChevronRight, Coins } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatNumber } from '@/lib/utils'
import { useCurrency } from '@/context/CurrencyContext'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { springPhysics } from '@/lib/motion'
import { playClick, playTick } from '@/lib/audio'

interface ModelPricingSimulatorProps {
  inputTokens: number
  outputTokens: number
  cacheReadTokens: number
  totalCost: number
}

interface ModelTier {
  id: string
  name: string
  provider: 'Anthropic' | 'OpenAI' | 'DeepSeek'
  inputPerMillion: number
  outputPerMillion: number
  cacheReadPerMillion: number
  badge?: string
}

const MODELS: ModelTier[] = [
  {
    id: 'claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: 'Anthropic',
    inputPerMillion: 3.0,
    outputPerMillion: 15.0,
    cacheReadPerMillion: 0.3,
    badge: 'Coding SOTA',
  },
  {
    id: 'claude-3-5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    inputPerMillion: 0.8,
    outputPerMillion: 4.0,
    cacheReadPerMillion: 0.08,
    badge: 'Fast & Lean',
  },
  {
    id: 'gpt-4o',
    name: 'OpenAI GPT-4o',
    provider: 'OpenAI',
    inputPerMillion: 2.5,
    outputPerMillion: 10.0,
    cacheReadPerMillion: 1.25,
  },
  {
    id: 'o3-mini',
    name: 'OpenAI o3-mini',
    provider: 'OpenAI',
    inputPerMillion: 1.1,
    outputPerMillion: 4.4,
    cacheReadPerMillion: 0.55,
    badge: 'Reasoning',
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    inputPerMillion: 0.14,
    outputPerMillion: 0.28,
    cacheReadPerMillion: 0.014,
    badge: 'Ultra Low Cost',
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    inputPerMillion: 0.55,
    outputPerMillion: 2.19,
    cacheReadPerMillion: 0.14,
    badge: 'Open Reasoning',
  },
]

export function ModelPricingSimulator({
  inputTokens,
  outputTokens,
  cacheReadTokens,
  totalCost,
}: ModelPricingSimulatorProps) {
  const { formatCurrency } = useCurrency()
  const [selectedModelId, setSelectedModelId] = useState<string>('claude-3-5-haiku')

  // Effective tokens (default to meaningful test volume if fresh install with 0 tokens)
  const effInput = inputTokens > 0 ? inputTokens : 2_500_000
  const effOutput = outputTokens > 0 ? outputTokens : 450_000
  const effCache = cacheReadTokens > 0 ? cacheReadTokens : 8_000_000
  const isEstimatedData = inputTokens === 0

  const activeModel = useMemo(() => {
    return MODELS.find((m) => m.id === selectedModelId) || MODELS[1]
  }, [selectedModelId])

  const simulatedCost = useMemo(() => {
    const inputCost = (effInput * activeModel.inputPerMillion) / 1_000_000
    const outputCost = (effOutput * activeModel.outputPerMillion) / 1_000_000
    const cacheCost = (effCache * activeModel.cacheReadPerMillion) / 1_000_000
    return inputCost + outputCost + cacheCost
  }, [effInput, effOutput, effCache, activeModel])

  const sonnetBaselineCost = useMemo(() => {
    const sonnet = MODELS[0]
    const inputCost = (effInput * sonnet.inputPerMillion) / 1_000_000
    const outputCost = (effOutput * sonnet.outputPerMillion) / 1_000_000
    const cacheCost = (effCache * sonnet.cacheReadPerMillion) / 1_000_000
    return inputCost + outputCost + cacheCost
  }, [effInput, effOutput, effCache])

  const diffUsd = simulatedCost - sonnetBaselineCost
  const diffPercent = sonnetBaselineCost > 0 ? (diffUsd / sonnetBaselineCost) * 100 : 0

  return (
    <Card className="border border-white/10 bg-[#080808] shadow-lg overflow-hidden relative">
      <CardHeader className="p-5 pb-3 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-white">
            <Calculator className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <CardTitle className="text-xs font-semibold text-white tracking-wide uppercase font-mono">
              Model Pricing & Arbitrage Simulator
            </CardTitle>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Simulate session expenditure across alternative frontier & reasoning models
            </p>
          </div>
        </div>

        {isEstimatedData && (
          <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px] font-mono">
            Benchmark Volume (2.5M in / 450k out)
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        {/* Model Picker Horizontal Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {MODELS.map((model) => {
            const isSelected = model.id === selectedModelId
            return (
              <motion.button
                key={model.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  playClick()
                  setSelectedModelId(model.id)
                }}
                className={`relative p-3 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-emerald-500/50 bg-emerald-500/[0.08] text-white shadow-md'
                    : 'border-white/5 bg-white/[0.02] text-zinc-400 hover:border-white/15 hover:text-zinc-200'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="active-model-pill"
                    transition={springPhysics.subtle}
                    className="absolute inset-0 rounded-lg border border-emerald-500/40 pointer-events-none"
                  />
                )}
                <div className="text-[10px] font-mono uppercase text-zinc-500">
                  {model.provider}
                </div>
                <div className="text-xs font-semibold mt-0.5 truncate text-white">
                  {model.name}
                </div>
                {model.badge && (
                  <span className="inline-block mt-1 text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-zinc-300">
                    {model.badge}
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Comparison Callout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Simulated Total Cost */}
          <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              Projected Model Spend
            </span>
            <div className="text-2xl font-bold font-mono text-white tracking-tight tabular-nums">
              <AnimatedNumber value={simulatedCost} formatter={formatCurrency} />
            </div>
            <div className="text-[11px] font-mono text-zinc-500 pt-1">
              ${activeModel.inputPerMillion}/M in · ${activeModel.outputPerMillion}/M out
            </div>
          </div>

          {/* Variance vs Claude 3.7 Sonnet */}
          <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              Differential vs Claude 3.7 Sonnet
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl font-bold font-mono tracking-tight tabular-nums ${
                  diffPercent < 0 ? 'text-emerald-400' : diffPercent > 0 ? 'text-rose-400' : 'text-zinc-300'
                }`}
              >
                {diffPercent < 0 ? '-' : diffPercent > 0 ? '+' : ''}
                {Math.abs(diffPercent).toFixed(1)}%
              </span>
              <span className="text-xs font-mono text-zinc-400">
                ({formatCurrency(Math.abs(diffUsd))} {diffUsd < 0 ? 'saved' : 'increase'})
              </span>
            </div>
            <div className="text-[11px] font-mono text-zinc-500 pt-1">
              Baseline Sonnet: {formatCurrency(sonnetBaselineCost)}
            </div>
          </div>

          {/* Workload Profile Summary */}
          <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5 space-y-1.5">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              Simulated Token Batch
            </span>
            <div className="space-y-1 text-[11px] font-mono text-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-500">Input Tokens:</span>
                <span>{formatNumber(effInput)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Output Tokens:</span>
                <span>{formatNumber(effOutput)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Cache Read:</span>
                <span className="text-emerald-400">{formatNumber(effCache)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
