import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProvenanceBadge } from '@/components/ui/provenance-badge'
import { formatNumber, formatCurrency, formatRelativeTime } from '@/lib/utils'
import { exportToCsv, exportToJson, copyMarkdownTable } from '@/lib/export'
import { Search, FolderGit2, Download, Copy, Check } from 'lucide-react'

interface ProjectsProps {
  onSelectProject: (projectId: string) => void
}

function getToolDisplayName(toolSource: string): string {
  switch (toolSource) {
    case 'claude_code': return 'Claude Code'
    case 'cline': return 'Cline'
    case 'roo_code': return 'Roo Code'
    case 'antigravity': return 'Antigravity'
    case 'aider': return 'Aider'
    case 'cursor': return 'Cursor'
    case 'windsurf': return 'Windsurf'
    case 'continue': return 'Continue.dev'
    case 'proxy': return 'Local Proxy'
    default: return toolSource
  }
}

export function Projects({ onSelectProject }: ProjectsProps) {
  const [projects, setProjects] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const loadProjects = async () => {
    if (window.electronAPI) {
      try {
        const res = await window.electronAPI.getProjects()
        setProjects(res)
      } catch (err) {
        console.error('Failed to load projects:', err)
      } finally {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    loadProjects()
    if (window.electronAPI) {
      const unsub = window.electronAPI.onDataUpdated(() => {
        loadProjects()
      })
      return () => unsub()
    }
  }, [])

  const filteredProjects = projects.filter((p) => {
    if ((p.totalTokens || 0) <= 0 || (p.sessionCount || 0) <= 0) return false
    const q = searchQuery.toLowerCase()
    return p.name.toLowerCase().includes(q) || p.path.toLowerCase().includes(q)
  })

  const [copiedMarkdown, setCopiedMarkdown] = useState(false)

  const handleExportCsv = () => {
    exportToCsv(
      `token_tracker_projects_${new Date().toISOString().slice(0, 10)}`,
      [
        { key: 'name', label: 'Project Name' },
        { key: 'path', label: 'Path' },
        { key: 'toolSource', label: 'Agent Source', format: (v) => getToolDisplayName(v) },
        { key: 'provenance', label: 'Data Provenance' },
        { key: 'sessionCount', label: 'Session Count' },
        { key: 'totalTokens', label: 'Total Tokens' },
        { key: 'inputTokens', label: 'Input Tokens' },
        { key: 'outputTokens', label: 'Output Tokens' },
        { key: 'cacheReadTokens', label: 'Cache Read Tokens' },
        { key: 'totalCost', label: 'Total Cost USD' },
        { key: 'lastActivity', label: 'Last Activity', format: (v) => new Date(v).toLocaleString() },
      ],
      filteredProjects
    )
  }

  const handleExportJson = () => {
    exportToJson(
      `token_tracker_projects_${new Date().toISOString().slice(0, 10)}`,
      filteredProjects
    )
  }

  const handleCopyMarkdown = async () => {
    const success = await copyMarkdownTable(
      'Token Tracker — Projects Telemetry Summary',
      {
        TotalProjects: filteredProjects.length,
        ActiveFilter: searchQuery || 'None',
      },
      ['Project Name', 'Agent', 'Sessions', 'Total Tokens', 'Total Spend'],
      filteredProjects.map((p) => [
        p.name,
        getToolDisplayName(p.toolSource),
        p.sessionCount,
        formatNumber(p.totalTokens),
        formatCurrency(p.totalCost),
      ])
    )
    if (success) {
      setCopiedMarkdown(true)
      setTimeout(() => setCopiedMarkdown(false), 2000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1f1f1f]">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white">
            Projects
          </h1>
          <p className="text-xs text-[#888888] mt-1">
            Workspaces and local repositories tracked across detected coding assistants.
          </p>
        </div>
        <div className="w-full sm:w-64 relative">
          <Search className="w-3.5 h-3.5 text-[#666666] absolute left-3 top-2.5" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs bg-black border-[#262626] text-white placeholder:text-[#555555] focus-visible:ring-1 focus-visible:ring-white/20"
          />
        </div>
      </div>

      {/* Projects Table */}
      <Card className="bg-[#050505] border-[#1f1f1f]">
        <CardHeader className="p-4 px-5 pb-3 border-b border-[#1f1f1f] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-xs font-mono uppercase tracking-wider text-[#888888]">
            Monitored Repositories ({filteredProjects.length})
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportCsv}
              disabled={filteredProjects.length === 0}
              className="h-7 text-xs px-2.5 border-[#262626] bg-[#0c0c0c] hover:bg-[#181818] text-[#cccccc] hover:text-white"
              title="Export as CSV"
            >
              <Download className="w-3 h-3 mr-1" />
              CSV
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportJson}
              disabled={filteredProjects.length === 0}
              className="h-7 text-xs px-2.5 border-[#262626] bg-[#0c0c0c] hover:bg-[#181818] text-[#cccccc] hover:text-white"
              title="Export as JSON"
            >
              <Download className="w-3 h-3 mr-1" />
              JSON
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyMarkdown}
              disabled={filteredProjects.length === 0}
              className="h-7 text-xs px-2.5 border-[#262626] bg-[#0c0c0c] hover:bg-[#181818] text-[#cccccc] hover:text-white"
              title="Copy table as Markdown"
            >
              {copiedMarkdown ? (
                <>
                  <Check className="w-3 h-3 mr-1 text-[#10b981]" />
                  <span className="text-[#10b981]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" />
                  Markdown
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center text-xs text-[#666666] font-mono">
              Loading projects...
            </div>
          ) : filteredProjects.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#1f1f1f] hover:bg-transparent">
                  <TableHead className="w-[32%] text-[11px] uppercase tracking-wider text-[#666666] font-mono pl-5">Project</TableHead>
                  <TableHead className="w-[14%] text-[11px] uppercase tracking-wider text-[#666666] font-mono">Source</TableHead>
                  <TableHead className="w-[12%] text-[11px] uppercase tracking-wider text-[#666666] font-mono">Confidence</TableHead>
                  <TableHead className="w-[10%] text-[11px] uppercase tracking-wider text-[#666666] font-mono text-right">Sessions</TableHead>
                  <TableHead className="w-[14%] text-[11px] uppercase tracking-wider text-[#666666] font-mono text-right">Total Tokens</TableHead>
                  <TableHead className="w-[10%] text-[11px] uppercase tracking-wider text-[#666666] font-mono text-right">Cost</TableHead>
                  <TableHead className="w-[8%] text-[11px] uppercase tracking-wider text-[#666666] font-mono text-right pr-5">Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((p) => {
                  return (
                    <TableRow
                      key={p.id}
                      onClick={() => onSelectProject(p.id)}
                      className="cursor-pointer border-b border-[#141414] hover:bg-[#0c0c0c] transition-colors"
                    >
                      <TableCell className="font-sans font-medium text-white pl-5 py-3">
                        <div className="flex items-center space-x-2.5">
                          <FolderGit2 className="w-3.5 h-3.5 text-[#888888] flex-shrink-0" />
                          <div className="truncate max-w-sm">
                            <span className="text-white text-xs font-semibold block">{p.name}</span>
                            <span className="text-[11px] font-mono text-[#666666] truncate block">
                              {p.path}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <Badge
                          variant="outline"
                          className="border-[#222222] bg-[#0f0f0f] text-[#aaaaaa] font-mono text-[10px] px-2 py-0"
                        >
                          {getToolDisplayName(p.toolSource)}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3">
                        <ProvenanceBadge provenance={p.provenance} />
                      </TableCell>

                      <TableCell className="text-right font-mono text-xs text-[#888888] py-3 tabular-nums">
                        {p.sessionCount}
                      </TableCell>

                      <TableCell className="text-right font-mono text-xs font-semibold text-white py-3 tabular-nums">
                        {formatNumber(p.totalTokens)}
                      </TableCell>

                      <TableCell className="text-right font-mono text-xs text-[#10b981] font-medium py-3 tabular-nums">
                        {formatCurrency(p.totalCost)}
                      </TableCell>

                      <TableCell className="text-right text-[11px] text-[#666666] font-mono py-3 pr-5 tabular-nums">
                        {formatRelativeTime(p.lastActivity)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="py-16 text-center text-xs text-[#666666] font-mono">
              No projects found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
