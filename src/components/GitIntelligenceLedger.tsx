import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { GitBranch, GitCommit, GitPullRequest, Copy, Check, Terminal, ArrowUpRight, Coins, Code2, Sparkles, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { formatNumber } from '@/lib/utils'
import { useCurrency } from '@/context/CurrencyContext'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { springPhysics } from '@/lib/motion'
import { playClick, playSuccess, playTick } from '@/lib/audio'

interface GitCommitRecord {
  sha: string
  shortSha: string
  author: string
  timestamp: number
  relativeTime: string
  message: string
  filesChanged: number
  insertions: number
  deletions: number
  totalLinesChanged: number
  attributedTokens: number
  attributedCost: number
  tokensPerLine: number
  costPerLine: number
}

interface GitBranchSummary {
  name: string
  isCurrent: boolean
  commitCount: number
  totalTokens: number
  totalCost: number
}

interface GitIntelligenceData {
  isGitRepo: boolean
  currentBranch: string
  branches: GitBranchSummary[]
  commits: GitCommitRecord[]
  totalAttributedSpend: number
  totalAttributedTokens: number
}

interface GitIntelligenceLedgerProps {
  projectId: string
  projectName?: string
}

export function GitIntelligenceLedger({ projectId, projectName }: GitIntelligenceLedgerProps) {
  const { formatCurrency } = useCurrency()
  const [data, setData] = useState<GitIntelligenceData | null>(null)
  const [selectedBranch, setSelectedBranch] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [copiedSha, setCopiedSha] = useState<string | null>(null)
  const [copiedPrMarkdown, setCopiedPrMarkdown] = useState(false)
  const [showPrModal, setShowPrModal] = useState(false)
  const [prMarkdownText, setPrMarkdownText] = useState('')

  const loadGitData = async () => {
    if (!window.electronAPI?.getProjectGitIntelligence) return
    setIsLoading(true)
    try {
      const res = await window.electronAPI.getProjectGitIntelligence(projectId)
      setData(res)
      if (res && res.currentBranch) {
        setSelectedBranch(res.currentBranch)
      }
    } catch (err) {
      console.error('Failed to load git intelligence:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadGitData()
  }, [projectId])

  const handleCopySha = (sha: string) => {
    playClick()
    navigator.clipboard.writeText(sha)
    setCopiedSha(sha)
    setTimeout(() => setCopiedSha(null), 1800)
  }

  const handleOpenPrSummary = async () => {
    playClick()
    if (!data) return
    if (window.electronAPI?.generatePrMarkdownSummary) {
      const md = await window.electronAPI.generatePrMarkdownSummary({
        branchName: selectedBranch || data.currentBranch,
        commits: data.commits,
        totalTokens: data.totalAttributedTokens,
        totalCost: data.totalAttributedSpend,
      })
      setPrMarkdownText(md)
    } else {
      // Fallback generator
      const md = `### 🤖 Token Tracker • PR Intelligence
Branch: \`${selectedBranch || data.currentBranch}\`
Total AI Tokens: ${formatNumber(data.totalAttributedTokens)}
Cost: ${formatCurrency(data.totalAttributedSpend)}`
      setPrMarkdownText(md)
    }
    setShowPrModal(true)
  }

  const handleCopyPrMarkdown = () => {
    playSuccess()
    navigator.clipboard.writeText(prMarkdownText)
    setCopiedPrMarkdown(true)
    setTimeout(() => setCopiedPrMarkdown(false), 2000)
  }

  if (isLoading) {
    return (
      <Card className="border border-white/10 bg-[#070707] p-8 text-center text-xs font-mono text-zinc-500">
        Inspecting Git repository history and correlating token intervals...
      </Card>
    )
  }

  if (!data || !data.isGitRepo) {
    return (
      <Card className="border border-white/10 bg-[#070707] p-6">
        <div className="flex items-center gap-2.5 text-zinc-400 text-xs font-mono">
          <GitBranch className="w-4 h-4 text-zinc-600" />
          <span>No local Git repository detected for this workspace path.</span>
        </div>
      </Card>
    )
  }

  return (
    <Card className="border border-white/10 bg-[#070707] shadow-xl overflow-hidden relative">
      <CardHeader className="p-5 pb-3 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <GitCommit className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-xs font-semibold text-white tracking-wide uppercase font-mono">
              Git Intelligence &amp; Cost-per-Commit ROI
            </CardTitle>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Correlated token consumption and financial spend per Git commit SHA
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleOpenPrSummary}
            className="h-7 text-xs px-3 border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium"
          >
            <GitPullRequest className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            <span>Generate PR Summary</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        {/* Branch Selector Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mr-1 flex items-center gap-1">
            <GitBranch className="w-3 h-3 text-zinc-400" />
            <span>Branch:</span>
          </span>
          {data.branches.map((b) => {
            const isSelected = selectedBranch === b.name
            return (
              <motion.button
                key={b.name}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  playTick()
                  setSelectedBranch(b.name)
                }}
                className={`relative px-2.5 py-1 rounded-md text-xs font-mono transition-all border ${
                  isSelected
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-white shadow-sm'
                    : 'border-white/5 bg-white/[0.02] text-zinc-400 hover:text-zinc-200 hover:border-white/15'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span>{b.name}</span>
                  {b.isCurrent && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Active HEAD" />
                  )}
                </span>
              </motion.button>
            )
          })}
        </div>

        {/* 3 Overview Metric Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Total Commits Tracked
            </span>
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              {data.commits.length}
            </div>
            <div className="text-[10px] font-mono text-zinc-500">
              Correlated within active turns
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Attributed Token Expenditure
            </span>
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              <AnimatedNumber value={data.totalAttributedTokens} formatter={formatNumber} />
            </div>
            <div className="text-[10px] font-mono text-emerald-400">
              Development compute volume
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Attributed Financial Cost
            </span>
            <div className="text-xl font-bold font-mono text-[#10b981] tabular-nums">
              <AnimatedNumber value={data.totalAttributedSpend} formatter={formatCurrency} />
            </div>
            <div className="text-[10px] font-mono text-zinc-500">
              Cumulative ROI investment
            </div>
          </div>
        </div>

        {/* Commits Table */}
        <div className="rounded-lg border border-white/5 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/5 bg-white/[0.02] hover:bg-transparent">
                <TableHead className="w-[12%] text-[10px] uppercase font-mono text-zinc-500 pl-4">Commit</TableHead>
                <TableHead className="w-[36%] text-[10px] uppercase font-mono text-zinc-500">Message</TableHead>
                <TableHead className="w-[14%] text-[10px] uppercase font-mono text-zinc-500 text-right">Diff (+/-)</TableHead>
                <TableHead className="w-[14%] text-[10px] uppercase font-mono text-zinc-500 text-right">AI Tokens</TableHead>
                <TableHead className="w-[12%] text-[10px] uppercase font-mono text-zinc-500 text-right">Cost</TableHead>
                <TableHead className="w-[12%] text-[10px] uppercase font-mono text-zinc-500 text-right pr-4">Efficiency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.commits.slice(0, 15).map((commit) => {
                const isCopied = copiedSha === commit.sha
                return (
                  <TableRow
                    key={commit.sha}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                  >
                    <TableCell className="font-mono text-xs pl-4 py-2.5">
                      <button
                        onClick={() => handleCopySha(commit.sha)}
                        title="Copy full SHA"
                        className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors"
                      >
                        <span className="text-emerald-400 font-semibold">{commit.shortSha}</span>
                        {isCopied ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-2.5 h-2.5 text-zinc-600 hover:text-zinc-400" />
                        )}
                      </button>
                    </TableCell>

                    <TableCell className="py-2.5">
                      <div className="text-xs text-white font-medium truncate max-w-sm">
                        {commit.message}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
                        {commit.author} · {commit.relativeTime}
                      </div>
                    </TableCell>

                    <TableCell className="text-right font-mono text-xs py-2.5 tabular-nums">
                      <span className="text-emerald-400">+{commit.insertions}</span>
                      <span className="text-zinc-600 mx-1">/</span>
                      <span className="text-rose-400">-{commit.deletions}</span>
                    </TableCell>

                    <TableCell className="text-right font-mono text-xs text-white font-medium py-2.5 tabular-nums">
                      {commit.attributedTokens > 0 ? formatNumber(commit.attributedTokens) : <span className="text-zinc-600">-</span>}
                    </TableCell>

                    <TableCell className="text-right font-mono text-xs text-emerald-400 font-medium py-2.5 tabular-nums">
                      {commit.attributedCost > 0 ? formatCurrency(commit.attributedCost) : <span className="text-zinc-600">-</span>}
                    </TableCell>

                    <TableCell className="text-right font-mono text-[11px] text-zinc-400 py-2.5 pr-4 tabular-nums">
                      {commit.tokensPerLine > 0 ? (
                        <span>{formatNumber(commit.tokensPerLine)} t/line</span>
                      ) : (
                        <span className="text-zinc-600">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* PR Markdown Generator Modal */}
      <AnimatePresence>
        {showPrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={springPhysics.subtle}
              className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <GitPullRequest className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-white">
                    Pull Request Cost Attribution Summary
                  </h3>
                </div>
                <button
                  onClick={() => setShowPrModal(false)}
                  className="text-xs text-zinc-500 hover:text-white transition-colors"
                >
                  Close
                </button>
              </div>

              <p className="text-xs text-zinc-400">
                Paste this markdown snippet directly into your GitHub / GitLab Pull Request description:
              </p>

              <div className="p-3 bg-black border border-white/10 rounded-lg max-h-72 overflow-y-auto font-mono text-[11px] text-zinc-300 leading-relaxed whitespace-pre-wrap select-all">
                {prMarkdownText}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPrModal(false)}
                  className="h-8 text-xs border-white/10 text-zinc-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCopyPrMarkdown}
                  className="h-8 text-xs bg-white text-black hover:bg-white/90 font-medium flex items-center gap-1.5"
                >
                  {copiedPrMarkdown ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied to Clipboard</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Markdown Snippet</span>
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Card>
  )
}
