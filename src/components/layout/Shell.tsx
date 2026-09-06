import React, { useState, useEffect } from 'react'
import { LayoutDashboard, FolderGit2, Settings, RefreshCw, Camera, CheckCircle2, XCircle, AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { TitleBar } from '@/components/layout/TitleBar'
import { AppLogo } from '@/components/ui/AppLogo'

export type PageId = 'dashboard' | 'projects' | 'session-detail' | 'settings'

interface ShellProps {
  activePage: PageId
  setActivePage: (page: PageId) => void
  selectedProjectId?: string
  setSelectedProjectId?: (id?: string) => void
  children: React.ReactNode
}

export function Shell({
  activePage,
  setActivePage,
  selectedProjectId,
  setSelectedProjectId,
  children,
}: ShellProps) {
  const [sources, setSources] = useState<any[]>([])
  const [isResyncing, setIsResyncing] = useState(false)
  const [screenshotStatus, setScreenshotStatus] = useState<string | null>(null)
  const [activeAlerts, setActiveAlerts] = useState<any[]>([])

  const loadAlerts = async () => {
    if (window.electronAPI) {
      try {
        const alerts = await window.electronAPI.getActiveBudgetAlerts()
        setActiveAlerts(alerts || [])
      } catch (err) {
        console.error('Failed to load active budget alerts:', err)
      }
    }
  }

  const loadSources = async () => {
    if (window.electronAPI) {
      try {
        const res = await window.electronAPI.getSourceStatuses()
        setSources(res)
      } catch (err) {
        console.error('Failed to load sources:', err)
      }
    }
  }

  const handleDismissAlert = async (alertId: string) => {
    if (window.electronAPI) {
      try {
        await window.electronAPI.dismissBudgetAlert(alertId)
        setActiveAlerts((prev) => prev.filter((a) => a.id !== alertId))
      } catch (err) {
        console.error('Failed to dismiss alert:', err)
      }
    }
  }

  useEffect(() => {
    loadSources()
    loadAlerts()
    if (window.electronAPI) {
      const unsubUpdate = window.electronAPI.onDataUpdated(() => {
        loadSources()
        loadAlerts()
      })
      const unsubAlert = window.electronAPI.onBudgetAlert((alert) => {
        setActiveAlerts((prev) => [alert, ...prev.filter((a) => a.id !== alert.id)])
      })
      return () => {
        unsubUpdate()
        unsubAlert()
      }
    }
  }, [])

  const handleResync = async () => {
    if (!window.electronAPI || isResyncing) return
    setIsResyncing(true)
    try {
      await window.electronAPI.forceResync()
      await loadSources()
    } catch (err) {
      console.error('Failed to resync:', err)
    } finally {
      setIsResyncing(false)
    }
  }

  const handleCaptureScreenshot = async () => {
    if (!window.electronAPI) return
    setScreenshotStatus('Capturing...')
    try {
      const pageName = activePage === 'session-detail' ? `session_detail` : activePage
      const res = await window.electronAPI.captureScreenshot(pageName)
      if (res.success) {
        setScreenshotStatus('Saved')
        setTimeout(() => setScreenshotStatus(null), 2000)
      } else {
        setScreenshotStatus('Failed')
        setTimeout(() => setScreenshotStatus(null), 2000)
      }
    } catch {
      setScreenshotStatus('Error')
      setTimeout(() => setScreenshotStatus(null), 2000)
    }
  }

  const navItems = [
    { id: 'dashboard' as PageId, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects' as PageId, label: 'Projects', icon: FolderGit2 },
    { id: 'settings' as PageId, label: 'Settings', icon: Settings },
  ]

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-black text-foreground font-sans antialiased">
        {/* Custom Window TitleBar with Branding and Controls */}
        <TitleBar />

        {/* Inner App Body */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Vercel-style Left Navigation Sidebar */}
          <aside className="w-60 flex-shrink-0 flex flex-col border-r border-[#1f1f1f] bg-black">
          {/* Navigation Section Header */}
          <div className="h-10 px-4 border-b border-[#1f1f1f] flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#777777] font-mono tracking-wider uppercase">
              Navigation
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activePage === item.id || (item.id === 'projects' && activePage === 'session-detail')
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'projects') {
                      if (setSelectedProjectId) setSelectedProjectId(undefined)
                    }
                    setActivePage(item.id)
                  }}
                  className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                    isActive
                      ? 'bg-[#181818] text-white border border-[#282828]'
                      : 'text-[#888888] hover:text-white hover:bg-[#111111]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#888888]'}`} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Sidebar Footer: Source Ingestion Health */}
          <div className="p-3 border-t border-[#1f1f1f] bg-black space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-medium text-[#777777] font-mono tracking-wider uppercase">
                Sources
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-[#888888] hover:text-white hover:bg-[#1c1c1c]"
                    onClick={handleResync}
                    disabled={isResyncing}
                  >
                    <RefreshCw className={`w-3 h-3 ${isResyncing ? 'animate-spin text-white' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Force resync local files</TooltipContent>
              </Tooltip>
            </div>

            <div className="space-y-1">
              {sources.map((src) => (
                <div
                  key={src.id}
                  className="flex items-center justify-between text-xs px-2 py-1 rounded bg-[#0a0a0a] border border-[#1f1f1f]"
                >
                  <span className="text-[#cccccc] text-[11px] font-medium">{src.name}</span>
                  {src.found ? (
                    <div className="flex items-center space-x-1 text-[#50e3c2] text-[10px] font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                      <span>Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-[#666666] text-[10px] font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#444444]" />
                      <span>Absent</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#000000]">
          {/* Top Header Bar */}
          <header className="h-14 px-6 border-b border-[#1f1f1f] flex items-center justify-between bg-black">
            <div className="flex items-center space-x-3">
              <span className="text-[13px] font-medium text-white capitalize">
                {activePage === 'session-detail' ? 'Project Sessions' : activePage}
              </span>
              {activePage === 'session-detail' && (
                <>
                  <span className="text-[#444444]">/</span>
                  <button
                    onClick={() => setActivePage('projects')}
                    className="text-xs text-[#888888] hover:text-white transition-colors"
                  >
                    Projects
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCaptureScreenshot}
                className="text-xs h-8 px-3 border-[#282828] bg-black hover:bg-[#141414] text-[#cccccc] hover:text-white"
              >
                <Camera className="w-3.5 h-3.5 mr-1.5" />
                <span>{screenshotStatus || 'Capture Screen'}</span>
              </Button>
            </div>
          </header>

          {/* Active Budget Alert Banner */}
          {activeAlerts.length > 0 && (
            <div className="bg-[#2a0808] border-b border-[#ef4444]/40 px-6 py-2.5 flex items-center justify-between text-xs font-mono text-[#fca5a5]">
              <div className="flex items-center space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-[#ef4444] shrink-0 animate-pulse" />
                <span>
                  <strong>Threshold Alert:</strong> {activeAlerts[0].projectName ? `Project "${activeAlerts[0].projectName}"` : 'Global'} {activeAlerts[0].period} limit exceeded ({activeAlerts[0].metric === 'cost' ? '$' + activeAlerts[0].currentValue.toFixed(2) : Math.round(activeAlerts[0].currentValue).toLocaleString() + ' tokens'} / {activeAlerts[0].metric === 'cost' ? '$' + activeAlerts[0].threshold.toFixed(2) : Math.round(activeAlerts[0].threshold).toLocaleString() + ' tokens'}).
                </span>
              </div>
              <button
                onClick={() => handleDismissAlert(activeAlerts[0].id)}
                className="p-1 rounded hover:bg-[#ef4444]/20 text-[#fca5a5]/70 hover:text-white transition-colors"
                title="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* View Container */}
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-6xl mx-auto">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </div>
          </main>
        </div>
      </div>
      </div>
    </TooltipProvider>
  )
}
