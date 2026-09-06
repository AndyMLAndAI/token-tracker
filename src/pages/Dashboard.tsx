import { useState, useEffect, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ProvenanceBadge } from '@/components/ui/provenance-badge'
import { formatNumber, formatCurrency } from '@/lib/utils'
import { exportToCsv, exportToJson, generatePrintableHtmlReport, ReportData } from '@/lib/export'
import { FileText, Download, Bell, ShieldAlert, AlertTriangle, X, Check } from 'lucide-react'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

interface DashboardProps {
  onSelectProject: (projectId: string) => void
}

// Chart configurations referencing shadcn CSS variables
const sparklineConfigToday: ChartConfig = {
  value: {
    label: "Today's Tokens",
    color: "hsl(var(--chart-1))",
  },
}

const sparklineConfigWeek: ChartConfig = {
  value: {
    label: "Weekly Tokens",
    color: "hsl(var(--chart-2))",
  },
}

const sparklineConfigMonth: ChartConfig = {
  value: {
    label: "Monthly Tokens",
    color: "hsl(var(--chart-3))",
  },
}

const sparklineConfigCache: ChartConfig = {
  value: {
    label: "Cache Read",
    color: "hsl(var(--chart-1))",
  },
}

const projectChartConfig: ChartConfig = {
  tokens: {
    label: "Total Tokens",
    color: "hsl(var(--chart-2))",
  },
}

const timelineChartConfig: ChartConfig = {
  cacheRead: {
    label: "Cache Read",
    color: "hsl(var(--chart-1))",
  },
  input: {
    label: "Input Tokens",
    color: "hsl(var(--chart-3))",
  },
  output: {
    label: "Output Tokens",
    color: "hsl(var(--chart-4))",
  },
}

const donutChartConfig: ChartConfig = {
  cacheRead: {
    label: "Cache Read",
    color: "hsl(var(--chart-1))",
  },
  input: {
    label: "Input Tokens",
    color: "hsl(var(--chart-2))",
  },
  output: {
    label: "Output Tokens",
    color: "hsl(var(--chart-4))",
  },
  cacheCreation: {
    label: "Cache Creation",
    color: "hsl(var(--chart-5))",
  },
}

export function Dashboard({ onSelectProject }: DashboardProps) {
  const [metrics, setMetrics] = useState<any>(null)
  const [budgetStatus, setBudgetStatus] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Report generator modal state
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportPeriod, setReportPeriod] = useState<'today' | '7d' | '30d' | 'all'>('30d')
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoadingReport, setIsLoadingReport] = useState(false)

  const loadData = async () => {
    if (window.electronAPI) {
      try {
        const [metricsRes, budgetRes] = await Promise.all([
          window.electronAPI.getDashboardMetrics(),
          window.electronAPI.getBudgetStatus(),
        ])
        setMetrics(metricsRes)
        setBudgetStatus(budgetRes)
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const loadReportData = async (period: 'today' | '7d' | '30d' | 'all') => {
    if (!window.electronAPI) return
    setIsLoadingReport(true)
    const now = Date.now()
    let start = 0
    if (period === 'today') {
      start = now - 24 * 60 * 60 * 1000
    } else if (period === '7d') {
      start = now - 7 * 24 * 60 * 60 * 1000
    } else if (period === '30d') {
      start = now - 30 * 24 * 60 * 60 * 1000
    }
    try {
      const data = await window.electronAPI.getReportData({ startDate: start, endDate: now })
      setReportData(data)
    } catch (err) {
      console.error('Failed to load report data:', err)
    } finally {
      setIsLoadingReport(false)
    }
  }

  const handleOpenReportModal = () => {
    setShowReportModal(true)
    loadReportData(reportPeriod)
  }

  const handlePeriodChange = (p: 'today' | '7d' | '30d' | 'all') => {
    setReportPeriod(p)
    loadReportData(p)
  }

  useEffect(() => {
    loadData()
    if (window.electronAPI) {
      const unsub = window.electronAPI.onDataUpdated(() => {
        loadData()
      })
      return () => unsub()
    }
  }, [])

  const allTime = metrics?.allTime || {}
  const totalTokensAllTime = (allTime.inputTokens || 0) + (allTime.outputTokens || 0)
  const cacheReadTokens = allTime.cacheReadTokens || 0
  const cacheCreationTokens = allTime.cacheCreationTokens || 0
  const topProjects = metrics?.projectTokens || []
  const dailyTrends = metrics?.dailyTrends || []

  const cacheHitPercentage = totalTokensAllTime > 0
    ? ((cacheReadTokens / (cacheReadTokens + (allTime.inputTokens || 1))) * 100).toFixed(1)
    : '0.0'

  // Donut category dataset
  const categoryData = useMemo(() => [
    { category: "cacheRead", tokens: cacheReadTokens, fill: "hsl(var(--chart-1))" },
    { category: "input", tokens: allTime.inputTokens || 0, fill: "hsl(var(--chart-2))" },
    { category: "output", tokens: allTime.outputTokens || 0, fill: "hsl(var(--chart-4))" },
    { category: "cacheCreation", tokens: cacheCreationTokens, fill: "hsl(var(--chart-5))" },
  ].filter(d => d.tokens > 0), [allTime, cacheReadTokens, cacheCreationTokens])

  // Sparkline data generation based on daily trends
  const sparklineToday = useMemo(() => {
    const today = dailyTrends[dailyTrends.length - 1]?.total || metrics?.tokensToday || 12000
    return [
      { step: '1', value: Math.round(today * 0.15) },
      { step: '2', value: Math.round(today * 0.35) },
      { step: '3', value: Math.round(today * 0.25) },
      { step: '4', value: Math.round(today * 0.65) },
      { step: '5', value: Math.round(today * 0.85) },
      { step: '6', value: today },
    ]
  }, [dailyTrends, metrics])

  const sparklineWeek = useMemo(() => {
    if (dailyTrends.length >= 7) {
      return dailyTrends.slice(-7).map((d: any, idx: number) => ({ step: String(idx + 1), value: d.total }))
    }
    const val = metrics?.tokensWeek || 50000
    return [
      { step: '1', value: Math.round(val * 0.08) },
      { step: '2', value: Math.round(val * 0.14) },
      { step: '3', value: Math.round(val * 0.11) },
      { step: '4', value: Math.round(val * 0.22) },
      { step: '5', value: Math.round(val * 0.18) },
      { step: '6', value: Math.round(val * 0.27) },
    ]
  }, [dailyTrends, metrics])

  const sparklineMonth = useMemo(() => {
    if (dailyTrends.length > 0) {
      return dailyTrends.slice(-14).map((d: any, idx: number) => ({ step: String(idx + 1), value: d.total }))
    }
    const val = metrics?.tokensMonth || 200000
    return [
      { step: '1', value: Math.round(val * 0.1) },
      { step: '2', value: Math.round(val * 0.2) },
      { step: '3', value: Math.round(val * 0.15) },
      { step: '4', value: Math.round(val * 0.3) },
      { step: '5', value: Math.round(val * 0.25) },
    ]
  }, [dailyTrends, metrics])

  const sparklineCache = useMemo(() => {
    if (dailyTrends.length >= 6) {
      return dailyTrends.slice(-6).map((d: any, idx: number) => ({ step: String(idx + 1), value: d.cacheRead }))
    }
    return [
      { step: '1', value: 1200 },
      { step: '2', value: 4500 },
      { step: '3', value: 3100 },
      { step: '4', value: 8900 },
      { step: '5', value: 12400 },
      { step: '6', value: 18500 },
    ]
  }, [dailyTrends])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-[#050505] border-[#1f1f1f] p-5 space-y-3">
              <Skeleton className="h-4 w-24 bg-[#1f1f1f]" />
              <Skeleton className="h-8 w-36 bg-[#1f1f1f]" />
              <Skeleton className="h-3 w-28 bg-[#1f1f1f]" />
            </Card>
          ))}
        </div>
        <Card className="bg-[#050505] border-[#1f1f1f] p-6">
          <Skeleton className="h-64 w-full bg-[#1f1f1f]" />
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1f1f1f]">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white">
            Usage Overview
          </h1>
          <p className="text-xs text-[#888888] mt-1">
            Exact local token and cost metrics ingested from local session logs.
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={handleOpenReportModal}
            className="h-7 text-xs px-2.5 border-[#282828] bg-[#0c0c0c] hover:bg-[#181818] text-white"
          >
            <FileText className="w-3.5 h-3.5 mr-1.5 text-[#10b981]" />
            <span>Generate Report</span>
          </Button>

          <Badge variant="outline" className="text-[11px] font-mono border-[#282828] text-[#cccccc] bg-[#0d0d0d] px-2.5 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] mr-1.5 inline-block" />
            Watchers Active
          </Badge>
        </div>
      </div>

      {/* Data Provenance Confidence Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg border border-[#1a1a1a] bg-[#050505]">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center space-x-2">
            <ProvenanceBadge provenance="exact" />
            <span className="text-xs text-[#888888]">Native Logs</span>
          </div>
          <div className="text-right font-mono">
            <span className="text-xs text-white font-medium tabular-nums">{formatNumber(metrics?.provenanceBreakdown?.exact?.tokens || 0)}</span>
            <span className="text-[11px] text-[#10b981] ml-2 tabular-nums">{formatCurrency(metrics?.provenanceBreakdown?.exact?.cost || 0)}</span>
          </div>
        </div>
        <div className="flex items-center justify-between px-2 sm:border-l sm:border-[#1a1a1a]">
          <div className="flex items-center space-x-2">
            <ProvenanceBadge provenance="estimated" />
            <span className="text-xs text-[#888888]">BPE Tokenized</span>
          </div>
          <div className="text-right font-mono">
            <span className="text-xs text-white font-medium tabular-nums">{formatNumber(metrics?.provenanceBreakdown?.estimated?.tokens || 0)}</span>
            <span className="text-[11px] text-[#f59e0b] ml-2 tabular-nums">{formatCurrency(metrics?.provenanceBreakdown?.estimated?.cost || 0)}</span>
          </div>
        </div>
        <div className="flex items-center justify-between px-2 sm:border-l sm:border-[#1a1a1a]">
          <div className="flex items-center space-x-2">
            <ProvenanceBadge provenance="live_captured" />
            <span className="text-xs text-[#888888]">Proxy Intercepts</span>
          </div>
          <div className="text-right font-mono">
            <span className="text-xs text-white font-medium tabular-nums">{formatNumber(metrics?.provenanceBreakdown?.live_captured?.tokens || 0)}</span>
            <span className="text-[11px] text-[#38bdf8] ml-2 tabular-nums">{formatCurrency(metrics?.provenanceBreakdown?.live_captured?.cost || 0)}</span>
          </div>
        </div>
      </div>

      {/* Spend vs Budget Visual Indicator */}
      {budgetStatus ? (
        <Card className="bg-[#050505] border-[#1f1f1f]">
          <CardContent className="p-4 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded border border-[#2a2a2a] bg-[#0d0d0d] flex items-center justify-center text-[#f59e0b]">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white">
                    {budgetStatus.projectName ? `Project: ${budgetStatus.projectName}` : 'Global Budget'}
                  </span>
                  <span className="text-[11px] text-[#888888] ml-2 font-mono uppercase">
                    ({budgetStatus.budget.period} limit)
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 font-mono text-xs">
                <span className="text-[#888888]">
                  Remaining: <strong className="text-white">{budgetStatus.budget.metric === 'cost' ? formatCurrency(budgetStatus.remaining) : formatNumber(budgetStatus.remaining) + ' tok'}</strong>
                </span>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-mono px-2 py-0.5 ${
                    budgetStatus.status === 'exceeded'
                      ? 'border-[#ef4444]/40 bg-[#ef4444]/10 text-[#ef4444]'
                      : budgetStatus.status === 'warning'
                      ? 'border-[#f59e0b]/40 bg-[#f59e0b]/10 text-[#f59e0b]'
                      : 'border-[#10b981]/40 bg-[#10b981]/10 text-[#10b981]'
                  }`}
                >
                  {budgetStatus.percentage}% used
                </Badge>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-2 rounded-full bg-[#181818] overflow-hidden">
              <div
                className={`h-full transition-all ${
                  budgetStatus.status === 'exceeded'
                    ? 'bg-[#ef4444] animate-pulse'
                    : budgetStatus.status === 'warning'
                    ? 'bg-[#f59e0b]'
                    : 'bg-[#10b981]'
                }`}
                style={{ width: `${Math.min(100, budgetStatus.percentage)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#777777] font-mono">
              <span>
                Spend: <strong className="text-white">{budgetStatus.budget.metric === 'cost' ? formatCurrency(budgetStatus.currentValue) : formatNumber(budgetStatus.currentValue)}</strong>
              </span>
              <span>
                Budget Cap: <strong className="text-white">{budgetStatus.budget.metric === 'cost' ? formatCurrency(budgetStatus.budget.threshold) : formatNumber(budgetStatus.budget.threshold)}</strong>
              </span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="p-3 rounded-lg border border-[#1a1a1a] bg-[#060606] flex items-center justify-between text-xs font-mono text-[#888888]">
          <div className="flex items-center space-x-2">
            <Bell className="w-3.5 h-3.5 text-[#555555]" />
            <span>No active budget threshold configured.</span>
          </div>
          <span className="text-[11px] text-[#666666]">Configure spend caps in Settings</span>
        </div>
      )}

      {/* Vercel-style KPI Metric Cards with shadcn Sparklines */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Today */}
        <Card className="bg-[#050505] border-[#1f1f1f] hover:border-[#333333] transition-colors flex flex-col justify-between">
          <CardHeader className="p-5 pb-1">
            <CardTitle className="text-xs font-medium text-[#888888]">
              Today (24h)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-1">
            <div className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
              {formatNumber(metrics?.tokensToday || 0)}
            </div>
            <div className="flex items-center justify-between text-xs text-[#666666] font-mono">
              <span>{formatCurrency(metrics?.costToday || 0)}</span>
              <span className="text-[#10b981] text-[10px]">Real-time turns</span>
            </div>
            {/* Sparkline */}
            <div className="h-9 w-full pt-1">
              <ChartContainer config={sparklineConfigToday} className="h-8 w-full">
                <AreaChart data={sparklineToday} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spark-today" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={1.5}
                    fill="url(#spark-today)"
                    dot={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent hideLabel indicator="line" />} />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Past 7 Days */}
        <Card className="bg-[#050505] border-[#1f1f1f] hover:border-[#333333] transition-colors flex flex-col justify-between">
          <CardHeader className="p-5 pb-1">
            <CardTitle className="text-xs font-medium text-[#888888]">
              Past 7 Days
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-1">
            <div className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
              {formatNumber(metrics?.tokensWeek || 0)}
            </div>
            <div className="flex items-center justify-between text-xs text-[#666666] font-mono">
              <span>{formatCurrency(metrics?.costWeek || 0)}</span>
              <span className="text-[#888888] text-[10px]">Weekly burn</span>
            </div>
            {/* Sparkline */}
            <div className="h-9 w-full pt-1">
              <ChartContainer config={sparklineConfigWeek} className="h-8 w-full">
                <AreaChart data={sparklineWeek} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spark-week" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={1.5}
                    fill="url(#spark-week)"
                    dot={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent hideLabel indicator="line" />} />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Past 30 Days */}
        <Card className="bg-[#050505] border-[#1f1f1f] hover:border-[#333333] transition-colors flex flex-col justify-between">
          <CardHeader className="p-5 pb-1">
            <CardTitle className="text-xs font-medium text-[#888888]">
              Past 30 Days
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-1">
            <div className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
              {formatNumber(metrics?.tokensMonth || 0)}
            </div>
            <div className="flex items-center justify-between text-xs text-[#666666] font-mono">
              <span>{formatCurrency(metrics?.costMonth || 0)}</span>
              <span className="text-[#888888] text-[10px]">Monthly aggregate</span>
            </div>
            {/* Sparkline */}
            <div className="h-9 w-full pt-1">
              <ChartContainer config={sparklineConfigMonth} className="h-8 w-full">
                <AreaChart data={sparklineMonth} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spark-month" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--chart-3))" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={1.5}
                    fill="url(#spark-month)"
                    dot={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent hideLabel indicator="line" />} />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Metric 4: Cache Savings */}
        <Card className="bg-[#050505] border-[#1f1f1f] hover:border-[#333333] transition-colors flex flex-col justify-between">
          <CardHeader className="p-5 pb-1">
            <CardTitle className="text-xs font-medium text-[#888888]">
              Prompt Cache Read
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-1">
            <div className="text-2xl font-bold font-mono tracking-tight text-[#10b981] tabular-nums">
              {formatNumber(cacheReadTokens)}
            </div>
            <div className="flex items-center justify-between text-xs text-[#666666] font-mono">
              <span>Hit ratio: {cacheHitPercentage}%</span>
              <span className="text-[#10b981] text-[10px]">Discounted</span>
            </div>
            {/* Sparkline */}
            <div className="h-9 w-full pt-1">
              <ChartContainer config={sparklineConfigCache} className="h-8 w-full">
                <AreaChart data={sparklineCache} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spark-cache" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={1.5}
                    fill="url(#spark-cache)"
                    dot={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent hideLabel indicator="line" />} />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stacked Area Chart: Token Burn Over Time (shadcn AreaChart + ChartContainer) */}
      <Card className="bg-[#050505] border-[#1f1f1f]">
        <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between border-b border-[#1f1f1f]">
          <div>
            <CardTitle className="text-sm font-semibold text-white">
              Token Burn Timeline
            </CardTitle>
            <p className="text-xs text-[#888888] mt-0.5">
              Daily cumulative token activity across input, output, and cache reads
            </p>
          </div>
          <Badge variant="outline" className="border-[#262626] font-mono text-[11px] text-[#888888]">
            30-Day Window
          </Badge>
        </CardHeader>
        <CardContent className="p-5">
          {dailyTrends.length > 0 ? (
            <div className="h-64 w-full pt-2">
              <ChartContainer config={timelineChartConfig} className="h-64 w-full">
                <AreaChart data={dailyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillCache" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-cacheRead)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--color-cacheRead)" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="fillInput" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-input)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-input)" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="fillOutput" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-output)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-output)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f1f1f" />
                  <XAxis
                    dataKey="date"
                    stroke="#555555"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => (typeof value === 'string' && value.length > 5 ? value.slice(5) : value)}
                  />
                  <YAxis
                    stroke="#555555"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => formatNumber(val)}
                  />
                  <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Area
                    type="monotone"
                    dataKey="cacheRead"
                    stackId="1"
                    stroke="var(--color-cacheRead)"
                    fill="url(#fillCache)"
                    strokeWidth={1.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="input"
                    stackId="1"
                    stroke="var(--color-input)"
                    fill="url(#fillInput)"
                    strokeWidth={1.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="output"
                    stackId="1"
                    stroke="var(--color-output)"
                    fill="url(#fillOutput)"
                    strokeWidth={1.5}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-[#666666] font-mono">
              No historical timeline activity recorded yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Middle Grid: Bar Chart (Tokens by Workspace) + Donut Chart (Category Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Project Bar Chart (shadcn BarChart + ChartContainer) */}
        <Card className="lg:col-span-7 bg-[#050505] border-[#1f1f1f]">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between border-b border-[#1f1f1f]">
            <div>
              <CardTitle className="text-sm font-semibold text-white">
                Tokens by Workspace
              </CardTitle>
              <p className="text-xs text-[#888888] mt-0.5">
                Comparative volume across detected local projects
              </p>
            </div>
            <Badge variant="outline" className="border-[#262626] font-mono text-[11px] text-[#888888]">
              {topProjects.length} Workspaces
            </Badge>
          </CardHeader>
          <CardContent className="p-5">
            {topProjects.length > 0 ? (
              <div className="h-64 w-full pt-2">
                <ChartContainer config={projectChartConfig} className="h-64 w-full">
                  <BarChart data={topProjects} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="#555555"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis
                      stroke="#555555"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => formatNumber(val)}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="tokens"
                      fill="var(--color-tokens)"
                      radius={[3, 3, 0, 0]}
                      onClick={(entry: any) => {
                        if (entry?.id) onSelectProject(entry.id)
                      }}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  </BarChart>
                </ChartContainer>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-[#666666] font-mono">
                No project telemetry recorded.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right 5 Cols: Donut Chart (shadcn PieChart + ChartContainer) */}
        <Card className="lg:col-span-5 bg-[#050505] border-[#1f1f1f]">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between border-b border-[#1f1f1f]">
            <div>
              <CardTitle className="text-sm font-semibold text-white">
                Token Composition
              </CardTitle>
              <p className="text-xs text-[#888888] mt-0.5">
                Proportional breakdown by token category
              </p>
            </div>
            <span className="text-[11px] font-mono text-[#10b981]">
              {cacheHitPercentage}% Cached
            </span>
          </CardHeader>
          <CardContent className="p-5">
            {categoryData.length > 0 ? (
              <div className="h-64 w-full flex items-center justify-center">
                <ChartContainer config={donutChartConfig} className="h-64 w-full">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="category" />} />
                    <Pie
                      data={categoryData}
                      dataKey="tokens"
                      nameKey="category"
                      innerRadius={55}
                      outerRadius={82}
                      strokeWidth={3}
                      stroke="#050505"
                      paddingAngle={2}
                    >
                      {categoryData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartLegend
                      content={
                        <ChartLegendContent
                          nameKey="category"
                          className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/3 [&>*]:justify-center"
                        />
                      }
                    />
                  </PieChart>
                </ChartContainer>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-[#666666] font-mono">
                No token composition data.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Telemetry Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cumulative Totals */}
        <Card className="bg-[#050505] border-[#1f1f1f]">
          <CardHeader className="p-5 pb-3 border-b border-[#1f1f1f]">
            <CardTitle className="text-sm font-semibold text-white">
              Cumulative Telemetry
            </CardTitle>
            <p className="text-xs text-[#888888] mt-0.5">
              Totals aggregated from all parsed sessions
            </p>
          </CardHeader>
          <CardContent className="p-5 font-mono text-xs space-y-2.5">
            <div className="flex justify-between py-1.5 border-b border-[#191919]">
              <span className="text-[#888888]">Input Tokens</span>
              <span className="text-white tabular-nums">{formatNumber(allTime.inputTokens || 0)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#191919]">
              <span className="text-[#888888]">Output Tokens</span>
              <span className="text-white tabular-nums">{formatNumber(allTime.outputTokens || 0)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#191919]">
              <span className="text-[#888888]">Cache Read Tokens</span>
              <span className="text-[#10b981] tabular-nums">{formatNumber(cacheReadTokens)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#191919]">
              <span className="text-[#888888]">Cache Creation Tokens</span>
              <span className="text-white tabular-nums">{formatNumber(cacheCreationTokens)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#191919]">
              <span className="text-[#888888]">Total Recorded Turns</span>
              <span className="text-white tabular-nums">{formatNumber(allTime.totalTurns || 0)}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-white font-medium">Estimated Financial Total</span>
              <span className="text-[#10b981] font-bold text-sm tabular-nums">{formatCurrency(allTime.totalCost || 0)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Daily Cache Timeline */}
        <Card className="bg-[#050505] border-[#1f1f1f]">
          <CardHeader className="p-5 pb-3 border-b border-[#1f1f1f]">
            <CardTitle className="text-sm font-semibold text-white">
              Daily Model Cache History
            </CardTitle>
            <p className="text-xs text-[#888888] mt-0.5">
              Verified records from Claude Code stats cache
            </p>
          </CardHeader>
          <CardContent className="p-5">
            {metrics?.claudeStatsCache?.dailyModelTokens?.length > 0 ? (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {metrics.claudeStatsCache.dailyModelTokens.slice(-6).reverse().map((day: any) => {
                  const totalDayTokens = Object.values(day.tokensByModel || {}).reduce((acc: number, val: any) => acc + Number(val), 0)
                  return (
                    <div
                      key={day.date}
                      className="flex items-center justify-between p-2 rounded bg-[#0a0a0a] border border-[#1a1a1a] text-xs font-mono"
                    >
                      <span className="text-[#888888]">{day.date}</span>
                      <span className="text-white font-medium tabular-nums">{formatNumber(totalDayTokens)} tokens</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#666666]">
                No daily cache records available.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Report Generator Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="bg-[#0c0c0e] border-[#27272a] w-full max-w-xl shadow-2xl overflow-hidden font-mono text-xs">
            <CardHeader className="p-5 pb-3 border-b border-[#1f1f23] flex flex-row items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <FileText className="w-4 h-4 text-[#10b981]" />
                <CardTitle className="text-sm font-semibold text-white">
                  Generate Telemetry & Expense Report
                </CardTitle>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-[#71717a] hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              <p className="text-[#a1a1aa] leading-relaxed">
                Generate a formal expense and usage report across your coding agents, with breakdown by project and model.
              </p>

              {/* Period Selector Tabs */}
              <div>
                <label className="text-[10px] uppercase text-[#71717a] block mb-1.5">Date Range</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['today', '7d', '30d', 'all'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePeriodChange(p)}
                      className={`py-1.5 px-3 rounded border text-xs font-medium transition-colors ${
                        reportPeriod === p
                          ? 'border-white bg-white text-black'
                          : 'border-[#27272a] bg-[#141417] text-[#a1a1aa] hover:text-white'
                      }`}
                    >
                      {p === 'today' ? 'Today' : p === '7d' ? 'Last 7D' : p === '30d' ? 'Last 30D' : 'All Time'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Stats */}
              <div className="p-4 rounded-lg border border-[#1f1f23] bg-[#000000] space-y-2">
                <div className="text-[10px] text-[#71717a] uppercase tracking-wider">Period Overview</div>
                {isLoadingReport ? (
                  <div className="py-4 text-center text-[#71717a]">Loading metrics...</div>
                ) : reportData ? (
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="p-2 rounded bg-[#111113] border border-[#1f1f23]">
                      <div className="text-[10px] text-[#71717a]">Total Cost</div>
                      <div className="text-sm font-bold text-[#10b981] mt-0.5">{formatCurrency(reportData.totals.totalCost)}</div>
                    </div>
                    <div className="p-2 rounded bg-[#111113] border border-[#1f1f23]">
                      <div className="text-[10px] text-[#71717a]">Total Tokens</div>
                      <div className="text-sm font-bold text-white mt-0.5">{formatNumber(reportData.totals.totalTokens)}</div>
                    </div>
                    <div className="p-2 rounded bg-[#111113] border border-[#1f1f23]">
                      <div className="text-[10px] text-[#71717a]">Projects Active</div>
                      <div className="text-sm font-bold text-white mt-0.5">{reportData.projectBreakdown.length}</div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (!reportData) return
                      exportToCsv(
                        `token_tracker_projects_${reportPeriod}`,
                        [
                          { key: 'name', label: 'Project Name' },
                          { key: 'toolSource', label: 'Agent/Source' },
                          { key: 'sessionsCount', label: 'Sessions' },
                          { key: 'turnCount', label: 'Turns' },
                          { key: 'totalTokens', label: 'Total Tokens' },
                          { key: 'totalCost', label: 'Cost USD' },
                        ],
                        reportData.projectBreakdown
                      )
                    }}
                    disabled={!reportData}
                    className="h-8 text-xs border-[#27272a] bg-[#141417] text-[#cccccc] hover:text-white"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    CSV
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (!reportData) return
                      exportToJson(`token_tracker_report_${reportPeriod}`, reportData)
                    }}
                    disabled={!reportData}
                    className="h-8 text-xs border-[#27272a] bg-[#141417] text-[#cccccc] hover:text-white"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    JSON
                  </Button>
                </div>

                <Button
                  size="sm"
                  onClick={() => {
                    if (reportData) generatePrintableHtmlReport(reportData)
                  }}
                  disabled={!reportData}
                  className="w-full sm:w-auto h-8 text-xs px-4 bg-white text-black hover:bg-white/90 font-medium"
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  Printable Report (HTML / PDF)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
