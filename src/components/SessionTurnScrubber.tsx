import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Sliders,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
  Cpu,
  ShieldAlert,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TurnDeltaMetric, analyzeCircuitBreaker } from '@/lib/circuit-breaker'
import { formatNumber } from '@/lib/utils'
import { useCurrency } from '@/context/CurrencyContext'
import { playClick, playTick, playSnap } from '@/lib/audio'
import { springPhysics } from '@/lib/motion'

interface SessionTurnScrubberProps {
  turns: Array<{
    id: string
    timestamp: number
    inputTokens: number
    outputTokens: number
    cacheReadTokens: number
    costUsd: number
    provenance?: string
  }>
  onSelectTurn?: (index: number) => void
}

export function SessionTurnScrubber({ turns, onSelectTurn }: SessionTurnScrubberProps) {
  const { formatCurrency } = useCurrency()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const deltas: TurnDeltaMetric[] = React.useMemo(() => {
    const analysis = analyzeCircuitBreaker(turns)
    return analysis.deltas
  }, [turns])

  // Select last turn by default when turns change
  useEffect(() => {
    if (deltas.length > 0) {
      setSelectedIndex(deltas.length - 1)
    }
  }, [deltas.length])

  // Playback timer loop
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setSelectedIndex((prev) => {
          if (prev >= deltas.length - 1) {
            setIsPlaying(false)
            return prev
          }
          playTick(0.03)
          return prev + 1
        })
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, deltas.length])

  const activeTurn = deltas[selectedIndex] || deltas[0]

  const handleSeek = (newIndex: number) => {
    playTick()
    setSelectedIndex(Math.max(0, Math.min(deltas.length - 1, newIndex)))
    if (onSelectTurn) onSelectTurn(newIndex)
  }

  const handleTogglePlay = () => {
    playClick()
    if (selectedIndex >= deltas.length - 1 && !isPlaying) {
      setSelectedIndex(0)
    }
    setIsPlaying(!isPlaying)
  }

  if (!deltas || deltas.length === 0) {
    return null
  }

  return (
    <Card className="border border-white/10 bg-[#070707] shadow-xl overflow-hidden relative">
      <CardHeader className="p-4 sm:p-5 pb-3 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-xs font-semibold text-white tracking-wide uppercase font-mono">
                Interactive Session Turn Replay &amp; Delta Diff
              </CardTitle>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400">
                Turn {selectedIndex + 1} of {deltas.length}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Scrub through the conversation timeline to inspect token inflation and cost step deltas
            </p>
          </div>
        </div>

        {/* Transport Controls */}
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            disabled={selectedIndex === 0}
            onClick={() => handleSeek(0)}
            className="h-7 w-7 p-0 border-white/10 bg-white/5 text-zinc-400 hover:text-white"
            title="First Turn"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={selectedIndex === 0}
            onClick={() => handleSeek(selectedIndex - 1)}
            className="h-7 w-7 p-0 border-white/10 bg-white/5 text-zinc-400 hover:text-white"
            title="Previous Turn"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleTogglePlay}
            className={`h-7 px-3 text-xs font-semibold border-white/10 ${
              isPlaying
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-white/10 text-white hover:bg-white/15'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 mr-1" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 mr-1" />
                <span>Play Replay</span>
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={selectedIndex === deltas.length - 1}
            onClick={() => handleSeek(selectedIndex + 1)}
            className="h-7 w-7 p-0 border-white/10 bg-white/5 text-zinc-400 hover:text-white"
            title="Next Turn"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={selectedIndex === deltas.length - 1}
            onClick={() => handleSeek(deltas.length - 1)}
            className="h-7 w-7 p-0 border-white/10 bg-white/5 text-zinc-400 hover:text-white"
            title="Latest Turn"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Timeline Slider Track */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>#1 (Start)</span>
            <span className="text-white font-medium">
              Turn #{selectedIndex + 1}
              {activeTurn && (
                <span className="text-zinc-500 ml-1.5">
                  ({new Date(activeTurn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})
                </span>
              )}
            </span>
            <span>#{deltas.length} (Latest)</span>
          </div>

          <div className="relative py-1">
            <input
              type="range"
              min="0"
              max={deltas.length - 1}
              value={selectedIndex}
              onChange={(e) => handleSeek(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Selected Turn Delta Card */}
        {activeTurn && (
          <motion.div
            key={activeTurn.turnIndex}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springPhysics.subtle}
            className="p-3.5 rounded-lg bg-white/[0.02] border border-white/5 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-white">
                  Turn #{activeTurn.turnIndex}
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  ID: {activeTurn.turnId.slice(0, 8)}...
                </span>
                {activeTurn.isRepetitiveLoop && (
                  <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-400 border-rose-500/30">
                    Repetitive Loop Pattern
                  </Badge>
                )}
                {activeTurn.isRapidBurst && (
                  <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/30">
                    Rapid Burst (&lt;12s)
                  </Badge>
                )}
              </div>

              <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span>Interval:</span>
                <span className="text-white font-semibold">
                  {activeTurn.intervalSec > 0 ? `+${activeTurn.intervalSec}s` : 'Initial turn'}
                </span>
              </div>
            </div>

            {/* 4 Stat Boxes for this Turn */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] font-mono uppercase text-zinc-500">Turn Input / Output</span>
                <div className="text-xs font-mono font-bold text-white tabular-nums">
                  {formatNumber(activeTurn.inputTokens)} / {formatNumber(activeTurn.outputTokens)}
                </div>
                <div className="text-[10px] font-mono text-zinc-500">
                  Total: {formatNumber(activeTurn.totalTokens)} tokens
                </div>
              </div>

              <div className="p-2.5 rounded bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] font-mono uppercase text-zinc-500">Token Step Delta</span>
                <div className="text-xs font-mono font-bold tabular-nums flex items-center gap-1">
                  {activeTurn.tokenDeltaVsPrev >= 0 ? (
                    <>
                      <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">+{formatNumber(activeTurn.tokenDeltaVsPrev)}</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="w-3 h-3 text-amber-400" />
                      <span className="text-amber-400">{formatNumber(activeTurn.tokenDeltaVsPrev)}</span>
                    </>
                  )}
                </div>
                <div className="text-[10px] font-mono text-zinc-500">
                  {activeTurn.tokenGrowthPct > 0 ? `+${activeTurn.tokenGrowthPct}%` : `${activeTurn.tokenGrowthPct}%`} growth
                </div>
              </div>

              <div className="p-2.5 rounded bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] font-mono uppercase text-zinc-500">Turn Cost</span>
                <div className="text-xs font-mono font-bold text-[#10b981] tabular-nums">
                  {formatCurrency(activeTurn.costUsd)}
                </div>
                <div className="text-[10px] font-mono text-zinc-500">
                  {activeTurn.costDeltaVsPrev >= 0 ? `+${formatCurrency(activeTurn.costDeltaVsPrev)}` : formatCurrency(activeTurn.costDeltaVsPrev)} step
                </div>
              </div>

              <div className="p-2.5 rounded bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] font-mono uppercase text-zinc-500">Cumulative Burn</span>
                <div className="text-xs font-mono font-bold text-white tabular-nums">
                  {formatNumber(activeTurn.cumulativeTokens)}
                </div>
                <div className="text-[10px] font-mono text-emerald-400">
                  {formatCurrency(activeTurn.cumulativeCost)} spent
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
