import { useState, useEffect, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProvenanceBadge } from '@/components/ui/provenance-badge'
import { formatNumber, formatCurrency, formatDate } from '@/lib/utils'
import { exportToCsv, exportToJson, copyMarkdownTable } from '@/lib/export'
import { ArrowLeft, ArrowUpDown, Terminal, Download, Copy, Check } from 'lucide-react'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'

interface SessionDetailProps {
  projectId: string
  onBack: () => void
}

type SortField = 'recency' | 'tokens' | 'cost'

const turnLineConfig: ChartConfig = {
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
}

export function SessionDetail({ projectId, onBack }: SessionDetailProps) {
  const [sessions, setSessions] = useState<any[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [turns, setTurns] = useState<any[]>([])
  const [sortField, setSortField] = useState<SortField>('recency')
  const [isLoading, setIsLoading] = useState(true)

  const loadSessions = async () => {
    if (window.electronAPI) {
      try {
        const res = await window.electronAPI.getProjectSessions(projectId)
        const valid = (res || []).filter((s: any) => (s.turnCount || 0) > 0 && (s.totalTokens || 0) > 0)
        setSessions(valid)
        if (valid.length > 0 && (!selectedSessionId || !valid.some((s: any) => s.id === selectedSessionId))) {
          setSelectedSessionId(valid[0].id)
        } else if (valid.length === 0) {
          setSelectedSessionId(null)
        }
      } catch (err) {
        console.error('Failed to load sessions:', err)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const loadTurns = async (sessionId: string) => {
    if (window.electronAPI) {
      try {
        const res = await window.electronAPI.getSessionTurns(sessionId)
        setTurns(res)
      } catch (err) {
        console.error('Failed to load turns:', err)
      }
    }
  }

  useEffect(() => {
    loadSessions()
    if (window.electronAPI) {
      const unsub = window.electronAPI.onDataUpdated(() => {
        loadSessions()
      })
      return () => unsub()
    }
  }, [projectId])

  useEffect(() => {
    if (selectedSessionId) {
      loadTurns(selectedSessionId)
    }
  }, [selectedSessionId])

  const sortedSessions = useMemo(() => {
    const valid = sessions.filter((s) => (s.turnCount || 0) > 0 && (s.totalTokens || 0) > 0)
    return valid.sort((a, b) => {
      if (sortField === 'tokens') {
        return b.totalTokens - a.totalTokens
      } else if (sortField === 'cost') {
        return b.totalCost - a.totalCost
      } else {
        return b.startTime - a.startTime
      }
    })
  }, [sessions, sortField])

  const selectedSession = sessions.find((s) => s.id === selectedSessionId)

  const turnsChartData = useMemo(() => {
    return turns.map((turn, index) => ({
      turn: `#${index + 1}`,
      input: turn.inputTokens,
      output: turn.outputTokens,
      cacheRead: turn.cacheReadTokens,
      cost: turn.costUsd,
    }))
  }, [turns])

  const [copiedSessionMarkdown, setCopiedSessionMarkdown] = useState(false)

  const handleExportSessionCsv = () => {
    if (!selectedSession || turns.length === 0) return
    exportToCsv(
      `session_${selectedSession.externalId || selectedSession.id}_turns`,
      [
        { key: 'turn', label: 'Turn Number' },
        { key: 'inputTokens', label: 'Input Tokens' },
        { key: 'outputTokens', label: 'Output Tokens' },
        { key: 'cacheReadTokens', label: 'Cache Read Tokens' },
        { key: 'costUsd', label: 'Cost USD' },
        { key: 'provenance', label: 'Provenance' },
        { key: 'timestamp', label: 'Timestamp', format: (v) => new Date(v).toLocaleString() },
      ],
      turns.map((t, idx) => ({ ...t, turn: idx + 1 }))
    )
  }

  const handleExportSessionJson = () => {
    if (!selectedSession || turns.length === 0) return
    exportToJson(
      `session_${selectedSession.externalId || selectedSession.id}_turns`,
      { session: selectedSession, turns }
    )
  }

  const handleCopySessionMarkdown = async () => {
    if (!selectedSession || turns.length === 0) return
    const success = await copyMarkdownTable(
      `Session Telemetry — ${selectedSession.externalId || selectedSession.id}`,
      {
        Model: selectedSession.model || 'Unknown',
        Turns: turns.length,
        TotalTokens: formatNumber(selectedSession.totalTokens),
        TotalCost: formatCurrency(selectedSession.totalCost),
      },
      ['Turn', 'Input', 'Output', 'Cache Read', 'Cost', 'Time'],
      turns.map((t, idx) => [
        `#${idx + 1}`,
        formatNumber(t.inputTokens),
        formatNumber(t.outputTokens),
        t.cacheReadTokens > 0 ? formatNumber(t.cacheReadTokens) : '-',
        formatCurrency(t.costUsd),
        new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ])
    )
    if (success) {
      setCopiedSessionMarkdown(true)
      setTimeout(() => setCopiedSessionMarkdown(false), 2000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1f1f1f]">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="h-7 text-xs px-2.5 border-[#282828] bg-black text-[#cccccc] hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-white">
              Session Inspector
            </h1>
            <p className="text-xs text-[#888888] mt-0.5">
              Turn-by-turn telemetry records for selected project sessions.
            </p>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center space-x-1 border border-[#222222] bg-[#0a0a0a] p-1 rounded-md">
          <span className="text-[11px] text-[#666666] font-mono px-2 flex items-center">
            <ArrowUpDown className="w-3 h-3 mr-1 text-[#666666]" />
            Sort:
          </span>
          <button
            onClick={() => setSortField('recency')}
            className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${
              sortField === 'recency' ? 'bg-[#222222] text-white' : 'text-[#888888] hover:text-white'
            }`}
          >
            Recency
          </button>
          <button
            onClick={() => setSortField('tokens')}
            className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${
              sortField === 'tokens' ? 'bg-[#222222] text-white' : 'text-[#888888] hover:text-white'
            }`}
          >
            Tokens
          </button>
          <button
            onClick={() => setSortField('cost')}
            className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${
              sortField === 'cost' ? 'bg-[#222222] text-white' : 'text-[#888888] hover:text-white'
            }`}
          >
            Cost
          </button>
        </div>
      </div>

      {/* Two Column Layout: Sessions List (Left) and Turn Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sessions List */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#666666]">
              Sessions ({sortedSessions.length})
            </span>
          </div>

          {isLoading ? (
            <div className="py-16 text-center text-xs text-[#666666] font-mono">
              Loading session records...
            </div>
          ) : sortedSessions.length > 0 ? (
            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
              {sortedSessions.map((session, index) => {
                const isSelected = session.id === selectedSessionId
                return (
                  <div
                    key={session.id}
                    onClick={() => setSelectedSessionId(session.id)}
                    className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#444444] bg-[#0f0f0f]'
                        : 'border-[#1a1a1a] bg-[#050505] hover:bg-[#0a0a0a] hover:border-[#2a2a2a]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Terminal className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#666666]'}`} />
                        <span className="font-mono text-xs text-white font-medium">
                          {session.externalId || `session_${index + 1}`}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <ProvenanceBadge provenance={session.provenance} />
                        <Badge variant="outline" className="border-[#262626] font-mono text-[10px] text-[#888888] px-1.5 py-0">
                          {session.turnCount} turns
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2 border-t border-[#1a1a1a] font-mono text-xs">
                      <div>
                        <span className="text-[10px] text-[#666666] block">Tokens</span>
                        <span className="text-white font-medium tabular-nums">{formatNumber(session.totalTokens)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#666666] block">Cost</span>
                        <span className="text-[#10b981] font-medium tabular-nums">{formatCurrency(session.totalCost)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1.5 text-[10px] text-[#666666] border-t border-[#141414] font-mono">
                      <span className="truncate max-w-[170px]">{session.model}</span>
                      <span>{formatDate(session.startTime).split(',')[0]}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <Card className="p-8 text-center text-xs text-[#666666] font-mono bg-[#050505] border-[#1f1f1f]">
              No sessions found for this workspace.
            </Card>
          )}
        </div>

        {/* Right Column: Turn-by-Turn Inspector & Line Chart */}
        <div className="lg:col-span-7 space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#666666]">
              Turn Execution Telemetry
            </span>
            {selectedSession && (
              <span className="text-[11px] font-mono text-[#888888]">
                {turns.length} API exchanges
              </span>
            )}
          </div>

          <Card className="bg-[#050505] border-[#1f1f1f]">
            <CardHeader className="p-4 px-5 pb-3 border-b border-[#1f1f1f]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-xs font-mono text-white">
                      {selectedSession?.externalId || 'Select a session'}
                    </CardTitle>
                    {selectedSession && <ProvenanceBadge provenance={selectedSession.provenance} />}
                  </div>
                  <p className="text-[11px] text-[#666666] mt-0.5 font-mono">
                    Model: <span className="text-[#aaaaaa]">{selectedSession?.model || 'N/A'}</span>
                  </p>
                </div>
                {selectedSession && (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleExportSessionCsv}
                        disabled={turns.length === 0}
                        className="h-6 text-[11px] px-2 border-[#262626] bg-[#0c0c0c] hover:bg-[#181818] text-[#cccccc] hover:text-white"
                        title="Export turns as CSV"
                      >
                        <Download className="w-2.5 h-2.5 mr-1" />
                        CSV
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleExportSessionJson}
                        disabled={turns.length === 0}
                        className="h-6 text-[11px] px-2 border-[#262626] bg-[#0c0c0c] hover:bg-[#181818] text-[#cccccc] hover:text-white"
                        title="Export session as JSON"
                      >
                        <Download className="w-2.5 h-2.5 mr-1" />
                        JSON
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopySessionMarkdown}
                        disabled={turns.length === 0}
                        className="h-6 text-[11px] px-2 border-[#262626] bg-[#0c0c0c] hover:bg-[#181818] text-[#cccccc] hover:text-white"
                        title="Copy turns as Markdown"
                      >
                        {copiedSessionMarkdown ? (
                          <>
                            <Check className="w-2.5 h-2.5 mr-1 text-[#10b981]" />
                            <span className="text-[#10b981]">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-2.5 h-2.5 mr-1" />
                            MD
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="text-right font-mono border-l border-[#1f1f1f] pl-3">
                      <span className="text-[10px] text-[#666666] block uppercase">Session Total</span>
                      <span className="text-xs font-bold text-[#10b981] tabular-nums">{formatCurrency(selectedSession.totalCost)}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {turns.length > 0 ? (
                <div>
                  {/* Turn Trajectory Line Chart (shadcn LineChart + ChartContainer) */}
                  {turns.length > 1 && (
                    <div className="p-4 border-b border-[#1a1a1a]">
                      <div className="text-[10px] font-mono uppercase text-[#666666] mb-2 flex items-center justify-between">
                        <span>Turn Token Trajectory (Input / Output / Cache)</span>
                        <span className="text-[#888888]">{turns.length} Turns Ingested</span>
                      </div>
                      <ChartContainer config={turnLineConfig} className="h-36 w-full">
                        <LineChart data={turnsChartData} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f1f1f" />
                          <XAxis
                            dataKey="turn"
                            stroke="#555555"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={6}
                          />
                          <YAxis
                            stroke="#555555"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) => formatNumber(val)}
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <ChartLegend content={<ChartLegendContent />} />
                          <Line
                            type="monotone"
                            dataKey="cacheRead"
                            stroke="var(--color-cacheRead)"
                            strokeWidth={1.5}
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="input"
                            stroke="var(--color-input)"
                            strokeWidth={1.5}
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="output"
                            stroke="var(--color-output)"
                            strokeWidth={1.5}
                            dot={false}
                          />
                        </LineChart>
                      </ChartContainer>
                    </div>
                  )}

                  {/* Turns Table */}
                  <div className="max-h-[440px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-[#1f1f1f] hover:bg-transparent">
                          <TableHead className="w-[10%] text-[10px] uppercase font-mono text-[#666666] pl-5">Turn</TableHead>
                          <TableHead className="w-[14%] text-[10px] uppercase font-mono text-[#666666]">Data</TableHead>
                          <TableHead className="w-[16%] text-[10px] uppercase font-mono text-[#666666] text-right">Input</TableHead>
                          <TableHead className="w-[16%] text-[10px] uppercase font-mono text-[#666666] text-right">Output</TableHead>
                          <TableHead className="w-[18%] text-[10px] uppercase font-mono text-[#666666] text-right">Cache Read</TableHead>
                          <TableHead className="w-[14%] text-[10px] uppercase font-mono text-[#666666] text-right">Cost</TableHead>
                          <TableHead className="w-[12%] text-[10px] uppercase font-mono text-[#666666] text-right pr-5">Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {turns.map((turn, index) => (
                          <TableRow key={turn.id} className="border-b border-[#141414] hover:bg-[#0c0c0c]">
                            <TableCell className="font-mono text-[#666666] pl-5 text-xs">
                              #{index + 1}
                            </TableCell>
                            <TableCell className="py-2">
                              <ProvenanceBadge provenance={turn.provenance} showIcon={false} />
                            </TableCell>
                            <TableCell className="text-right font-mono text-white text-xs tabular-nums">
                              {formatNumber(turn.inputTokens)}
                            </TableCell>
                            <TableCell className="text-right font-mono text-white text-xs tabular-nums">
                              {formatNumber(turn.outputTokens)}
                            </TableCell>
                            <TableCell className="text-right font-mono text-[#10b981] text-xs tabular-nums">
                              {turn.cacheReadTokens > 0 ? formatNumber(turn.cacheReadTokens) : '-'}
                            </TableCell>
                            <TableCell className="text-right font-mono text-white font-medium text-xs tabular-nums">
                              {formatCurrency(turn.costUsd)}
                            </TableCell>
                            <TableCell className="text-right text-[11px] text-[#666666] font-mono pr-5 tabular-nums">
                              {new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="py-24 text-center text-xs text-[#666666] font-mono">
                  Select a session on the left to inspect turns.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
