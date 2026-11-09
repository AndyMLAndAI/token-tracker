/**
 * Agentic Runaway Loop & Circular Error Detection Engine
 * Analyzes turn intervals, token variance, and payload repetitions to detect runaway automated loops.
 */

export interface LoopDetectionConfig {
  rapidIntervalThresholdSec: number
  repetitionVariancePct: number
  minRepetitiveTurns: number
  maxCostThresholdUsd: number
  maxTurnVelocityPerMinute: number
}

export const DEFAULT_LOOP_CONFIG: LoopDetectionConfig = {
  rapidIntervalThresholdSec: 12,
  repetitionVariancePct: 5,
  minRepetitiveTurns: 3,
  maxCostThresholdUsd: 5.0,
  maxTurnVelocityPerMinute: 8,
}

export interface TurnDeltaMetric {
  turnIndex: number
  turnId: string
  timestamp: number
  inputTokens: number
  outputTokens: number
  totalTokens: number
  costUsd: number
  cacheReadTokens: number
  cumulativeTokens: number
  cumulativeCost: number
  intervalSec: number
  tokenDeltaVsPrev: number
  tokenGrowthPct: number
  costDeltaVsPrev: number
  isRapidBurst: boolean
  isRepetitiveLoop: boolean
}

export interface CircuitBreakerAnalysis {
  status: 'normal' | 'caution' | 'tripped'
  riskScore: number // 0 to 100
  isTripped: boolean
  reasons: string[]
  rapidBurstCount: number
  cyclicLoopCount: number
  totalCostUsd: number
  totalTokens: number
  turnVelocityPerMin: number
  deltas: TurnDeltaMetric[]
  trippedTurnIndex?: number
}

export function analyzeCircuitBreaker(
  turns: Array<{
    id: string
    timestamp: number
    inputTokens: number
    outputTokens: number
    cacheReadTokens: number
    costUsd: number
    provenance?: string
  }>,
  customConfig?: Partial<LoopDetectionConfig>
): CircuitBreakerAnalysis {
  const config = { ...DEFAULT_LOOP_CONFIG, ...customConfig }

  if (!turns || turns.length === 0) {
    return {
      status: 'normal',
      riskScore: 0,
      isTripped: false,
      reasons: [],
      rapidBurstCount: 0,
      cyclicLoopCount: 0,
      totalCostUsd: 0,
      totalTokens: 0,
      turnVelocityPerMin: 0,
      deltas: [],
    }
  }

  // Ensure turns are ordered chronologically
  const sorted = [...turns].sort((a, b) => a.timestamp - b.timestamp)

  let cumTokens = 0
  let cumCost = 0
  let rapidBurstCount = 0
  let consecutiveRepetitiveCount = 0
  let maxConsecutiveRepetitive = 0

  const deltas: TurnDeltaMetric[] = sorted.map((turn, idx) => {
    const total = turn.inputTokens + turn.outputTokens
    cumTokens += total
    cumCost += turn.costUsd

    let intervalSec = 0
    let tokenDeltaVsPrev = 0
    let tokenGrowthPct = 0
    let costDeltaVsPrev = 0
    let isRapid = false
    let isRepetitive = false

    if (idx > 0) {
      const prevTurn = sorted[idx - 1]
      const prevTotal = prevTurn.inputTokens + prevTurn.outputTokens
      intervalSec = Math.max(0, (turn.timestamp - prevTurn.timestamp) / 1000)
      tokenDeltaVsPrev = total - prevTotal
      tokenGrowthPct = prevTotal > 0 ? (tokenDeltaVsPrev / prevTotal) * 100 : 0
      costDeltaVsPrev = turn.costUsd - prevTurn.costUsd

      // Check if rapid execution (< configured threshold)
      if (intervalSec > 0 && intervalSec <= config.rapidIntervalThresholdSec) {
        isRapid = true
        rapidBurstCount++
      }

      // Check for near-identical payload variance (< 5% change in total tokens)
      const absVariance = Math.abs(tokenGrowthPct)
      if (absVariance <= config.repetitionVariancePct && intervalSec <= 30) {
        isRepetitive = true
        consecutiveRepetitiveCount++
        if (consecutiveRepetitiveCount > maxConsecutiveRepetitive) {
          maxConsecutiveRepetitive = consecutiveRepetitiveCount
        }
      } else {
        consecutiveRepetitiveCount = 0
      }
    }

    return {
      turnIndex: idx + 1,
      turnId: turn.id,
      timestamp: turn.timestamp,
      inputTokens: turn.inputTokens,
      outputTokens: turn.outputTokens,
      totalTokens: total,
      costUsd: turn.costUsd,
      cacheReadTokens: turn.cacheReadTokens,
      cumulativeTokens: cumTokens,
      cumulativeCost: cumCost,
      intervalSec: Math.round(intervalSec * 10) / 10,
      tokenDeltaVsPrev,
      tokenGrowthPct: Math.round(tokenGrowthPct * 10) / 10,
      costDeltaVsPrev,
      isRapidBurst: isRapid,
      isRepetitiveLoop: isRepetitive,
    }
  })

  // Calculate Turn Velocity (turns / minute) over session span
  let turnVelocityPerMin = 0
  if (sorted.length > 1) {
    const totalDurationSec = (sorted[sorted.length - 1].timestamp - sorted[0].timestamp) / 1000
    if (totalDurationSec > 0) {
      turnVelocityPerMin = Math.round((sorted.length / (totalDurationSec / 60)) * 10) / 10
    }
  }

  // Compute Risk Score (0 - 100)
  let riskScore = 0
  const reasons: string[] = []

  // Factor 1: Consecutive cyclic turns
  if (maxConsecutiveRepetitive >= config.minRepetitiveTurns) {
    const cyclicRisk = Math.min(50, maxConsecutiveRepetitive * 15)
    riskScore += cyclicRisk
    reasons.push(`${maxConsecutiveRepetitive} consecutive turns with identical payload variance (<${config.repetitionVariancePct}%)`)
  }

  // Factor 2: High frequency rapid bursts
  if (rapidBurstCount >= 4) {
    const burstRisk = Math.min(30, rapidBurstCount * 5)
    riskScore += burstRisk
    reasons.push(`${rapidBurstCount} turns executed in rapid succession (<${config.rapidIntervalThresholdSec}s intervals)`)
  }

  // Factor 3: Turn velocity overload
  if (turnVelocityPerMin >= config.maxTurnVelocityPerMinute) {
    riskScore += 25
    reasons.push(`Turn velocity (${turnVelocityPerMin} turns/min) exceeds normal operational threshold (${config.maxTurnVelocityPerMinute}/min)`)
  }

  // Factor 4: Financial run-rate limit
  if (cumCost >= config.maxCostThresholdUsd) {
    riskScore += 25
    reasons.push(`Cumulative session cost ($${cumCost.toFixed(2)}) exceeded safeguard ceiling ($${config.maxCostThresholdUsd.toFixed(2)})`)
  }

  riskScore = Math.min(100, Math.max(0, riskScore))

  let status: 'normal' | 'caution' | 'tripped' = 'normal'
  let isTripped = false
  let trippedTurnIndex: number | undefined

  if (riskScore >= 70 || maxConsecutiveRepetitive >= 4 || cumCost > config.maxCostThresholdUsd * 1.5) {
    status = 'tripped'
    isTripped = true
    // Find earliest turn that triggered trip
    const tripTurn = deltas.find(d => d.isRepetitiveLoop && d.turnIndex >= config.minRepetitiveTurns)
    trippedTurnIndex = tripTurn ? tripTurn.turnIndex : deltas.length
  } else if (riskScore >= 35 || rapidBurstCount >= 2) {
    status = 'caution'
  }

  return {
    status,
    riskScore,
    isTripped,
    reasons,
    rapidBurstCount,
    cyclicLoopCount: maxConsecutiveRepetitive,
    totalCostUsd: cumCost,
    totalTokens: cumTokens,
    turnVelocityPerMin,
    deltas,
    trippedTurnIndex,
  }
}
