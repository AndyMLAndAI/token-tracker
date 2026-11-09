import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Search, LayoutDashboard, FolderGit2, Settings, RefreshCw, Camera, ArrowRight, CornerDownLeft, Sparkles, Terminal } from 'lucide-react'
import { PageId } from './layout/Shell'
import { snappySpring } from '@/lib/motion'
import { playClick, playTick, playSnap } from '@/lib/audio'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (page: PageId, projectId?: string) => void
  onResync: () => void
  onCaptureScreenshot: () => void
}

interface CommandItem {
  id: string
  title: string
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  category: 'Navigation' | 'Projects' | 'Actions'
  action: () => void
}

export function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  onResync,
  onCaptureScreenshot,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [projects, setProjects] = useState<any[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      playSnap()
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
      if (window.electronAPI?.getProjects) {
        window.electronAPI.getProjects().then((projs: any[]) => {
          setProjects(projs || [])
        }).catch(() => {})
      }
    }
  }, [isOpen])

  // Build command list
  const commands = useMemo<CommandItem[]>(() => {
    const navCommands: CommandItem[] = [
      {
        id: 'nav-dashboard',
        title: 'Dashboard',
        subtitle: 'Overview, sparklines, model breakdown and daily trends',
        icon: LayoutDashboard,
        category: 'Navigation',
        action: () => {
          onNavigate('dashboard')
          onClose()
        },
      },
      {
        id: 'nav-projects',
        title: 'Projects Directory',
        subtitle: 'View all monitored projects and session activity',
        icon: FolderGit2,
        category: 'Navigation',
        action: () => {
          onNavigate('projects')
          onClose()
        },
      },
      {
        id: 'nav-settings',
        title: 'Settings & Budgets',
        subtitle: 'Manage sources, thresholds, loopback proxy & tray',
        icon: Settings,
        category: 'Navigation',
        action: () => {
          onNavigate('settings')
          onClose()
        },
      },
    ]

    const actionCommands: CommandItem[] = [
      {
        id: 'act-resync',
        title: 'Force Re-sync Local Files',
        subtitle: 'Re-scan Claude Code, Antigravity, Cline and other sources',
        icon: RefreshCw,
        badge: 'Action',
        category: 'Actions',
        action: () => {
          onResync()
          onClose()
        },
      },
      {
        id: 'act-screenshot',
        title: 'Capture Window Screenshot',
        subtitle: 'Save a high-resolution PNG snapshot of the active view',
        icon: Camera,
        badge: 'Action',
        category: 'Actions',
        action: () => {
          onCaptureScreenshot()
          onClose()
        },
      },
    ]

    const projectCommands: CommandItem[] = projects.map((p) => ({
      id: `proj-${p.id}`,
      title: p.name,
      subtitle: `${p.sessionCount} sessions · ${p.totalTokens.toLocaleString()} tokens`,
      icon: Terminal,
      badge: p.toolSource,
      category: 'Projects',
      action: () => {
        onNavigate('session-detail', p.id)
        onClose()
      },
    }))

    return [...navCommands, ...projectCommands, ...actionCommands]
  }, [projects, onNavigate, onClose, onResync, onCaptureScreenshot])

  const filteredCommands = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter((c) =>
      c.title.toLowerCase().includes(q) ||
      (c.subtitle && c.subtitle.toLowerCase().includes(q)) ||
      (c.badge && c.badge.toLowerCase().includes(q))
    )
  }, [commands, query])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-selected="true"]') as HTMLElement
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      playTick()
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      playTick()
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredCommands[selectedIndex]) {
        playClick()
        filteredCommands[selectedIndex].action()
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Palette Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={snappySpring}
            className="relative w-full max-w-xl overflow-hidden rounded-xl border border-white/10 bg-[#0d0d0d]/95 shadow-2xl backdrop-blur-xl"
            onKeyDown={handleKeyDown}
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08] gap-3">
              <Search className="w-4 h-4 text-zinc-400 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search commands, projects, or actions... (Esc to close)"
                className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
              />
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-zinc-400">
                ESC
              </span>
            </div>

            {/* Results List */}
            <div
              ref={listRef}
              className="max-h-[380px] overflow-y-auto p-2 space-y-1"
            >
              {filteredCommands.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-500">
                  No matching commands or projects found
                </div>
              ) : (
                filteredCommands.map((cmd, idx) => {
                  const isSelected = idx === selectedIndex
                  const Icon = cmd.icon
                  return (
                    <motion.button
                      key={cmd.id}
                      data-selected={isSelected}
                      onClick={() => {
                        playClick()
                        cmd.action()
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      whileTap={{ scale: 0.99 }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all ${
                        isSelected
                          ? 'bg-white/10 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`p-1.5 rounded-md ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-white/5 text-zinc-400'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-white truncate flex items-center gap-2">
                            <span>{cmd.title}</span>
                            {cmd.badge && (
                              <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded border border-white/10 bg-white/5 text-zinc-400">
                                {cmd.badge}
                              </span>
                            )}
                          </div>
                          {cmd.subtitle && (
                            <div className="text-[11px] text-zinc-500 truncate">
                              {cmd.subtitle}
                            </div>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono pl-2 shrink-0">
                          <span>Select</span>
                          <CornerDownLeft className="w-3 h-3" />
                        </div>
                      )}
                    </motion.button>
                  )
                })
              )}
            </div>

            {/* Footer with Hotkey Tips */}
            <div className="px-4 py-2 border-t border-white/[0.06] bg-black/40 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10">↑</kbd>
                  <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10">↓</kbd>
                  <span>navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">↵</kbd>
                  <span>choose</span>
                </span>
              </div>
              <span className="text-[10px] text-zinc-600">Token Tracker Command</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
