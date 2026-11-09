import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ZapOff,
  Bell,
  Volume2,
  VolumeX,
  RotateCcw,
  SlidersHorizontal,
  Flame,
  Activity,
  Repeat,
  Radio,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  analyzeCircuitBreaker,
  CircuitBreakerAnalysis,
  LoopDetectionConfig,
  DEFAULT_LOOP_CONFIG,
} from '@/lib/circuit-breaker'
import { playAlarm, playClick, playSnap, playSuccess, playTick } from '@/lib/audio'
import { formatNumber } from '@/lib/utils'
import { useCurrency } from '@/context/CurrencyContext'
import { springPhysics } from '@/lib/motion'

interface CircuitBreakerMonitorProps {
  turns: Array<{
    id: string
    timestamp: number
    inputTokens: number
    outputTokens: number
    cacheReadTokens: number
    costUsd: number
    provenance?: string
  }>
  sessionId?: string
  modelName?: string
}

export function CircuitBreakerMonitor({
  turns,
  sessionId,
  modelName,
}: CircuitBreakerMonitorProps) {
  const { formatCurrency } = useCurrency()

  const [config, setConfig] = useState<LoopDetectionConfig>(DEFAULT_LOOP_CONFIG)
  const [showConfig, setShowConfig] = useState(false)
  const [manualTrip, setManualTrip] = useState(false)
  const [autoNotify, setAutoNotify] = useState(true)
  const [soundAlarm, setSoundAlarm] = useState(true)

  const hasNotifiedRef = useRef(false)

  // Run the detection algorithm
  const analysis: CircuitBreakerAnalysis = useMemo(() => {
    const res = analyzeCircuitBreaker(turns, config)
    if (manualTrip) {
      return {
        ...res,
        status: 'tripped',
        isTripped: true,
        riskScore: Math.max(res.riskScore, 95),
        reasons: ['Manual emergency circuit breaker triggered by operator', ...res.reasons],
      }
    }
    return res
  }, [turns, config, manualTrip])

  // Fire desktop alert and audio alarm if tripped
  useEffect(() => {
    if (analysis.isTripped && !hasNotifiedRef.current) {
      hasNotifiedRef.current = true

      if (soundAlarm) {
        playAlarm(0.15)
      }

      if (autoNotify && window.electronAPI?.triggerCircuitBreakerAlert) {
        const reasonText = analysis.reasons[0] || 'Runaway agentic loop condition detected'
        window.electronAPI.triggerCircuitBreakerAlert({
          sessionId,
          reason: reasonText,
          costUsd: analysis.totalCostUsd,
        })
      }
    } else if (!analysis.isTripped) {
      hasNotifiedRef.current = false
    }
  }, [analysis.isTripped, analysis.reasons, analysis.totalCostUsd, autoNotify, soundAlarm, sessionId])

  const handleToggleManualTrip = () => {
    playSnap()
    setManualTrip((prev) => {
      const next = !prev
      if (next && soundAlarm) {
        playAlarm(0.12)
      }
      return next
    })
  }

  const handleTestAlarm = () => {
    playClick()
    playAlarm(0.12)
  }

  const getStatusColor = () => {
    if (analysis.status === 'tripped') return 'text-rose-400 bg-rose-500/10 border-rose-500/30'
    if (analysis.status === 'caution') return 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
  }

  return (
    <Card
      className={`border transition-all duration-300 bg-[#070707] shadow-xl overflow-hidden relative ${
        analysis.status === 'tripped'
          ? 'border-rose-500/50 shadow-rose-950/20 shadow-2xl ring-1 ring-rose-500/20'
          : analysis.status === 'caution'
          ? 'border-amber-500/40'
          : 'border-white/10'
      }`}
    >
      <CardHeader className="p-4 sm:p-5 pb-3 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-md flex items-center justify-center border transition-colors ${
              analysis.status === 'tripped'
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse'
                : analysis.status === 'caution'
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}
          >
            {analysis.status === 'tripped' ? (
              <ZapOff className="w-4 h-4" />
            ) : analysis.status === 'caution' ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-xs font-semibold text-white tracking-wide uppercase font-mono">
                Agentic Circuit Breaker &amp; Loop Guard
              </CardTitle>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider font-semibold ${getStatusColor()}`}
              >
                {analysis.status === 'tripped'
                  ? 'BREAKER TRIPPED'
                  : analysis.status === 'caution'
                  ? 'ELEVATED RISK'
                  : 'SAFE / NOMINAL'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Autonomous runaway iteration, circular retry loop, and budget runaway protection
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              playClick()
              setShowConfig(!showConfig)
            }}
            className={`h-7 text-xs px-2.5 border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 ${
              showConfig ? 'border-white/30 text-white' : ''
            }`}
            title="Configure Thresholds"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
            <span>Thresholds</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleToggleManualTrip}
            className={`h-7 text-xs px-3 font-semibold transition-all ${
              analysis.isTripped
                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                : 'border-rose-500/50 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
            }`}
          >
            {analysis.isTripped ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                <span>Reset Breaker</span>
              </>
            ) : (
              <>
                <ZapOff className="w-3.5 h-3.5 mr-1.5" />
                <span>Trip Breaker</span>
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Risk Score Progress Bar & Key Indicators */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-zinc-500" />
              <span>Real-Time Loop Risk Score:</span>
            </span>
            <span
              className={`font-bold tabular-nums ${
                analysis.riskScore >= 70
                  ? 'text-rose-400'
                  : analysis.riskScore >= 35
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {analysis.riskScore}%
            </span>
          </div>

          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
            <motion.div
              initial={false}
              animate={{ width: `${analysis.riskScore}%` }}
              transition={springPhysics.snappy}
              className={`h-full rounded-full ${
                analysis.riskScore >= 70
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                  : analysis.riskScore >= 35
                  ? 'bg-gradient-to-r from-emerald-500 to-amber-500'
                  : 'bg-emerald-500'
              }`}
            />
          </div>
        </div>

        {/* 4 Diagnostic Indicator Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-zinc-500 text-[10px] font-mono uppercase">
              <span>Cyclic Loops</span>
              <Repeat className="w-3 h-3 text-zinc-400" />
            </div>
            <div
              className={`text-base font-bold font-mono tabular-nums ${
                analysis.cyclicLoopCount >= config.minRepetitiveTurns
                  ? 'text-rose-400'
                  : 'text-white'
              }`}
            >
              {analysis.cyclicLoopCount} turns
            </div>
            <div className="text-[10px] font-mono text-zinc-500 truncate">
              Variance &lt;{config.repetitionVariancePct}%
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-zinc-500 text-[10px] font-mono uppercase">
              <span>Rapid Bursts</span>
              <Flame className="w-3 h-3 text-zinc-400" />
            </div>
            <div
              className={`text-base font-bold font-mono tabular-nums ${
                analysis.rapidBurstCount >= 3 ? 'text-amber-400' : 'text-white'
              }`}
            >
              {analysis.rapidBurstCount}
            </div>
            <div className="text-[10px] font-mono text-zinc-500 truncate">
              Interval &lt;{config.rapidIntervalThresholdSec}s
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-zinc-500 text-[10px] font-mono uppercase">
              <span>Velocity</span>
              <Radio className="w-3 h-3 text-zinc-400" />
            </div>
            <div
              className={`text-base font-bold font-mono tabular-nums ${
                analysis.turnVelocityPerMin >= config.maxTurnVelocityPerMinute
                  ? 'text-amber-400'
                  : 'text-white'
              }`}
            >
              {analysis.turnVelocityPerMin}/min
            </div>
            <div className="text-[10px] font-mono text-zinc-500 truncate">
              Limit: {config.maxTurnVelocityPerMinute}/min
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-zinc-500 text-[10px] font-mono uppercase">
              <span>Spend vs Limit</span>
              <ShieldAlert className="w-3 h-3 text-zinc-400" />
            </div>
            <div
              className={`text-base font-bold font-mono tabular-nums ${
                analysis.totalCostUsd >= config.maxCostThresholdUsd
                  ? 'text-rose-400'
                  : 'text-emerald-400'
              }`}
            >
              {formatCurrency(analysis.totalCostUsd)}
            </div>
            <div className="text-[10px] font-mono text-zinc-500 truncate">
              Ceiling: {formatCurrency(config.maxCostThresholdUsd)}
            </div>
          </div>
        </div>

        {/* Warning Alert Banner (if caution or tripped) */}
        {analysis.reasons.length > 0 && (
          <div
            className={`p-3 rounded-lg border text-xs font-mono space-y-1.5 ${
              analysis.status === 'tripped'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            <div className="font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                {analysis.status === 'tripped'
                  ? 'Circuit Breaker Tripped - Automated Safeguard Engaged'
                  : 'Agent Loop Risk Warning'}
              </span>
            </div>
            <ul className="list-disc list-inside text-[11px] text-zinc-300 space-y-0.5">
              {analysis.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Config / Settings Drawer */}
        <AnimatePresence>
          {showConfig && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={springPhysics.subtle}
              className="p-3.5 rounded-lg bg-black/60 border border-white/10 space-y-3 pt-3"
            >
              <div className="flex items-center justify-between pb-1 border-b border-white/5">
                <span className="text-xs font-semibold text-white uppercase font-mono tracking-wider">
                  Circuit Breaker Sensitivity Settings
                </span>
                <button
                  onClick={handleTestAlarm}
                  className="text-[10px] font-mono text-zinc-400 hover:text-white flex items-center gap-1"
                >
                  <Volume2 className="w-3 h-3 text-amber-400" />
                  <span>Test Audio Alarm</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400">
                    Max Spend Ceiling ($USD):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={config.maxCostThresholdUsd}
                    onChange={(e) =>
                      setConfig({ ...config, maxCostThresholdUsd: parseFloat(e.target.value) || 1 })
                    }
                    className="w-full bg-black border border-white/10 rounded px-2 py-1 text-white text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400">
                    Min Cyclic Repetitive Turns:
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={config.minRepetitiveTurns}
                    onChange={(e) =>
                      setConfig({ ...config, minRepetitiveTurns: parseInt(e.target.value, 10) || 3 })
                    }
                    className="w-full bg-black border border-white/10 rounded px-2 py-1 text-white text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400">
                    Rapid Burst Threshold (seconds):
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="60"
                    value={config.rapidIntervalThresholdSec}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        rapidIntervalThresholdSec: parseInt(e.target.value, 10) || 10,
                      })
                    }
                    className="w-full bg-black border border-white/10 rounded px-2 py-1 text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] font-mono text-zinc-400">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoNotify}
                    onChange={(e) => setAutoNotify(e.target.checked)}
                    className="rounded border-white/20 bg-black text-emerald-500"
                  />
                  <span>Native Desktop Emergency Notification</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={soundAlarm}
                    onChange={(e) => setSoundAlarm(e.target.checked)}
                    className="rounded border-white/20 bg-black text-rose-500"
                  />
                  <span>Procedural Audio Siren</span>
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
