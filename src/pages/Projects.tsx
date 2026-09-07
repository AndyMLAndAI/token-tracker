import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProvenanceBadge } from '@/components/ui/provenance-badge'
import { formatNumber, formatCurrency, formatRelativeTime } from '@/lib/utils'
import { exportToCsv, exportToJson, copyMarkdownTable } from '@/lib/export'
import {
  Search,
  FolderGit2,
  Download,
  Copy,
  Check,
  Star,
  Edit2,
  Palette,
  AlignJustify,
  List,
} from 'lucide-react'
import { useUnlock } from '@/context/UnlockContext'
import { LockedBadge } from '@/components/ui/LockedBadge'

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
  const { isUnlocked, checkAndRecordExport, openUnlockModal } = useUnlock()
  const [projects, setProjects] = useState<any[]>([])
  const [projectMeta, setProjectMeta] = useState<Record<string, { nickname?: string; isPinned: boolean; customColor?: string }>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isDense, setIsDense] = useState(() => {
    return localStorage.getItem('token_tracker_dense_projects') === 'true'
  })
  const [copiedMarkdown, setCopiedMarkdown] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [nicknameInput, setNicknameInput] = useState('')

  const loadProjects = async () => {
    if (window.electronAPI) {
      try {
        const [projectsRes, metaRes] = await Promise.all([
          window.electronAPI.getProjects(),
          window.electronAPI.getProjectMetadata ? window.electronAPI.getProjectMetadata() : Promise.resolve({}),
        ])
        setProjects(projectsRes)
        setProjectMeta(metaRes || {})
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

  const handleTogglePin = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation()
    if (!isUnlocked) {
      openUnlockModal('Pin / Favorite Projects')
      return
    }
    if (window.electronAPI?.togglePinProject) {
      await window.electronAPI.togglePinProject(projectId)
      loadProjects()
    }
  }

  const handleStartEditNickname = (e: React.MouseEvent, project: any) => {
    e.stopPropagation()
    if (!isUnlocked) {
      openUnlockModal('Custom Project Nicknames')
      return
    }
    setEditingProjectId(project.id)
    setNicknameInput(projectMeta[project.id]?.nickname || project.name)
  }

  const handleSaveNickname = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation()
    if (window.electronAPI?.setProjectNickname) {
      await window.electronAPI.setProjectNickname({ projectId, nickname: nicknameInput })
      setEditingProjectId(null)
      loadProjects()
    }
  }

  const handleColorChange = async (e: React.ChangeEvent<HTMLInputElement>, projectId: string) => {
    const color = e.target.value
    if (!isUnlocked) {
      openUnlockModal('Custom Project Chart Colors')
      return
    }
    if (window.electronAPI?.setProjectColor) {
      await window.electronAPI.setProjectColor({ projectId, color })
      loadProjects()
    }
  }

  const handleToggleDense = () => {
    if (!isUnlocked) {
      openUnlockModal('Compact / Dense Table View')
      return
    }
    const next = !isDense
    setIsDense(next)
    localStorage.setItem('token_tracker_dense_projects', String(next))
  }

  // Filter & sort: Pinned first, then by activity
  const filteredProjects = projects
    .filter((p) => {
      if ((p.totalTokens || 0) <= 0 || (p.sessionCount || 0) <= 0) return false
      const meta = projectMeta[p.id]
      const displayName = meta?.nickname || p.name
      const q = searchQuery.toLowerCase()
      return displayName.toLowerCase().includes(q) || p.path.toLowerCase().includes(q)
    })
    .sort((a, b) => {
      const pinA = projectMeta[a.id]?.isPinned ? 1 : 0
      const pinB = projectMeta[b.id]?.isPinned ? 1 : 0
      if (pinA !== pinB) return pinB - pinA
      return (b.lastActivity || 0) - (a.lastActivity || 0)
    })

  const handleExportCsv = async () => {
    const allowed = await checkAndRecordExport()
    if (!allowed) return

    exportToCsv(
      `token_tracker_projects_${new Date().toISOString().slice(0, 10)}`,
      [
        { key: 'name', label: 'Project Name', format: (_v, p) => projectMeta[p.id]?.nickname || p.name },
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

  const handleExportJson = async () => {
    const allowed = await checkAndRecordExport()
    if (!allowed) return

    exportToJson(
      `token_tracker_projects_${new Date().toISOString().slice(0, 10)}`,
      filteredProjects.map((p) => ({
        ...p,
        nickname: projectMeta[p.id]?.nickname,
        isPinned: projectMeta[p.id]?.isPinned ?? false,
        customColor: projectMeta[p.id]?.customColor,
      }))
    )
  }

  const handleCopyMarkdown = async () => {
    const allowed = await checkAndRecordExport()
    if (!allowed) return

    const success = await copyMarkdownTable(
      'Token Tracker — Projects Telemetry Summary',
      {
        TotalProjects: filteredProjects.length,
        ActiveFilter: searchQuery || 'None',
      },
      ['Project Name', 'Agent', 'Sessions', 'Total Tokens', 'Total Spend'],
      filteredProjects.map((p) => [
        projectMeta[p.id]?.nickname || p.name,
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
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-white">
              Projects
            </h1>
            {!isUnlocked && (
              <LockedBadge featureName="Pro Project Features" label="Pro QoL Available" />
            )}
          </div>
          <p className="text-xs text-[#888888] mt-1">
            Workspaces and local repositories tracked across detected coding assistants.
          </p>
        </div>
        <div className="w-full sm:w-64 relative">
          <Search className="w-3.5 h-3.5 text-[#666666] absolute left-3 top-2.5" />
          <Input
            placeholder="Search projects or nicknames..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs bg-black border-[#262626] text-white placeholder:text-[#555555] focus-visible:ring-1 focus-visible:ring-white/20"
          />
        </div>
      </div>

      {/* Projects Table */}
      <Card className="bg-[#050505] border-[#1f1f1f]">
        <CardHeader className="p-4 px-5 pb-3 border-b border-[#1f1f1f] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-[#888888]">
              Monitored Repositories ({filteredProjects.length})
            </CardTitle>

            {/* QoL 1: Compact View Toggle */}
            <button
              onClick={handleToggleDense}
              title={isUnlocked ? (isDense ? 'Switch to Normal Table' : 'Switch to Dense Table') : 'Dense Table (Click to unlock)'}
              className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border transition-colors ${
                isDense && isUnlocked
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                  : 'border-[#262626] bg-[#0c0c0c] text-[#888888] hover:text-white'
              }`}
            >
              {isDense ? <AlignJustify className="w-3 h-3" /> : <List className="w-3 h-3" />}
              <span>Dense</span>
              {!isUnlocked && <LockedBadge featureName="Compact Table View" className="ml-1" />}
            </button>
          </div>
          
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
                  const meta = projectMeta[p.id]
                  const isPinned = meta?.isPinned ?? false
                  const nickname = meta?.nickname
                  const customColor = meta?.customColor
                  const isEditing = editingProjectId === p.id

                  return (
                    <TableRow
                      key={p.id}
                      onClick={() => onSelectProject(p.id)}
                      className={`cursor-pointer border-b border-[#141414] hover:bg-[#0c0c0c] transition-colors ${
                        isPinned ? 'bg-[#0e0e0a]/40' : ''
                      }`}
                    >
                      <TableCell className={`font-sans font-medium text-white pl-5 ${isDense && isUnlocked ? 'py-1.5' : 'py-3'}`}>
                        <div className="flex items-center space-x-2.5">
                          {/* QoL 3: Pin/Favorite Button */}
                          <button
                            type="button"
                            onClick={(e) => handleTogglePin(e, p.id)}
                            title={isPinned ? 'Unpin project' : 'Pin to top (Click to unlock)'}
                            className={`p-1 rounded transition-colors ${
                              isPinned
                                ? 'text-amber-400 hover:text-amber-300'
                                : 'text-[#444444] hover:text-[#888888]'
                            }`}
                          >
                            <Star className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-400' : ''}`} />
                          </button>

                          {/* Custom project color indicator (QoL 14) */}
                          <div className="relative group/color" onClick={(e) => e.stopPropagation()}>
                            <div
                              className="w-3.5 h-3.5 rounded flex items-center justify-center border border-white/10 shrink-0"
                              style={{ backgroundColor: customColor || '#1f1f1f' }}
                            >
                              <FolderGit2 className="w-2.5 h-2.5 text-[#888888]" />
                            </div>
                            <label
                              title="Custom project chart color (Click to unlock)"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onClick={(e) => {
                                if (!isUnlocked) {
                                  e.preventDefault()
                                  openUnlockModal('Custom Chart Color Per Project')
                                }
                              }}
                            >
                              <input
                                type="color"
                                value={customColor || '#10b981'}
                                onChange={(e) => handleColorChange(e, p.id)}
                                disabled={!isUnlocked}
                                className="hidden"
                              />
                            </label>
                          </div>

                          <div className="truncate max-w-sm flex-1">
                            {isEditing ? (
                              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="text"
                                  value={nicknameInput}
                                  onChange={(e) => setNicknameInput(e.target.value)}
                                  className="h-6 px-1.5 text-xs bg-black border border-emerald-500/50 rounded text-white focus:outline-none"
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={(e) => handleSaveNickname(e, p.id)}
                                  className="px-1.5 py-0.5 text-[10px] bg-emerald-500 text-black font-semibold rounded"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingProjectId(null)
                                  }}
                                  className="px-1.5 py-0.5 text-[10px] text-zinc-400 hover:text-white"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 group/nick">
                                <span className="text-white text-xs font-semibold">
                                  {nickname || p.name}
                                </span>
                                {nickname && (
                                  <span className="text-[10px] font-mono text-zinc-500">
                                    ({p.name})
                                  </span>
                                )}
                                {/* QoL 4: Edit Nickname */}
                                <button
                                  type="button"
                                  onClick={(e) => handleStartEditNickname(e, p)}
                                  title="Edit project nickname"
                                  className="opacity-0 group-hover/nick:opacity-100 transition-opacity p-0.5 text-zinc-500 hover:text-zinc-200"
                                >
                                  <Edit2 className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            )}
                            <span className="text-[11px] font-mono text-[#666666] truncate block">
                              {p.path}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className={isDense && isUnlocked ? 'py-1.5' : 'py-3'}>
                        <Badge
                          variant="outline"
                          className="border-[#222222] bg-[#0f0f0f] text-[#aaaaaa] font-mono text-[10px] px-2 py-0"
                        >
                          {getToolDisplayName(p.toolSource)}
                        </Badge>
                      </TableCell>

                      <TableCell className={isDense && isUnlocked ? 'py-1.5' : 'py-3'}>
                        <ProvenanceBadge provenance={p.provenance} />
                      </TableCell>

                      <TableCell className={`text-right font-mono text-xs text-[#888888] tabular-nums ${isDense && isUnlocked ? 'py-1.5' : 'py-3'}`}>
                        {p.sessionCount}
                      </TableCell>

                      <TableCell className={`text-right font-mono text-xs font-semibold text-white tabular-nums ${isDense && isUnlocked ? 'py-1.5' : 'py-3'}`}>
                        {formatNumber(p.totalTokens)}
                      </TableCell>

                      <TableCell className={`text-right font-mono text-xs text-[#10b981] font-medium tabular-nums ${isDense && isUnlocked ? 'py-1.5' : 'py-3'}`}>
                        {formatCurrency(p.totalCost)}
                      </TableCell>

                      <TableCell className={`text-right text-[11px] text-[#666666] font-mono pr-5 tabular-nums ${isDense && isUnlocked ? 'py-1.5' : 'py-3'}`}>
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
