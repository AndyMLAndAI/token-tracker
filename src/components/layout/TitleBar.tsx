import React, { useState, useEffect } from 'react'
import { Minus, Square, X } from 'lucide-react'
import { AppLogo } from '@/components/ui/AppLogo'

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    if (window.electronAPI?.isWindowMaximized) {
      window.electronAPI.isWindowMaximized().then(setIsMaximized).catch(() => {})
    }

    if (window.electronAPI?.onWindowMaximizedChange) {
      const unsub = window.electronAPI.onWindowMaximizedChange((max) => {
        setIsMaximized(max)
      })
      return unsub
    }
  }, [])

  const handleMinimize = () => {
    window.electronAPI?.minimizeWindow?.()
  }

  const handleMaximizeToggle = () => {
    window.electronAPI?.maximizeWindow?.()
  }

  const handleClose = () => {
    window.electronAPI?.closeWindow?.()
  }

  return (
    <div
      className="h-[34px] w-full bg-black border-b border-[#1f1f1f] flex items-center justify-between select-none z-50 text-foreground"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Left: App Branding (App Icon + Title + Version Badge) */}
      <div
        className="flex items-center space-x-2.5 px-3 h-full"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <AppLogo size={16} />
        <span className="font-sans font-semibold text-[12px] tracking-tight text-white">
          Token Tracker
        </span>
        <span className="text-[10px] font-mono border border-[#262626] rounded px-1.5 py-0.2 text-[#888888] bg-[#0c0c0c]">
          v1.8
        </span>
      </div>

      {/* Center: Draggable Middle Region */}
      <div
        className="flex-1 h-full cursor-default"
        onDoubleClick={handleMaximizeToggle}
      />

      {/* Right: Window Controls (Minimize, Maximize/Restore, Close) */}
      <div
        className="flex items-center h-full"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* Minimize */}
        <button
          onClick={handleMinimize}
          title="Minimize"
          aria-label="Minimize window"
          className="h-full w-11 flex items-center justify-center text-[#888888] hover:text-white hover:bg-[#1a1a1a] transition-colors duration-100"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        {/* Maximize / Restore */}
        <button
          onClick={handleMaximizeToggle}
          title={isMaximized ? 'Restore Down' : 'Maximize'}
          aria-label={isMaximized ? 'Restore Down' : 'Maximize'}
          className="h-full w-11 flex items-center justify-center text-[#888888] hover:text-white hover:bg-[#1a1a1a] transition-colors duration-100"
        >
          {isMaximized ? (
            /* Overlapping dual-square restore icon */
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              className="w-3 h-3"
            >
              <rect x="2.5" y="0.5" width="7" height="7" rx="0.5" />
              <path d="M0.5 2.5V9.5H7.5" />
            </svg>
          ) : (
            <Square className="w-3 h-3" strokeWidth={1.5} />
          )}
        </button>

        {/* Close */}
        <button
          onClick={handleClose}
          title="Close"
          aria-label="Close window"
          className="h-full w-11 flex items-center justify-center text-[#888888] hover:text-white hover:bg-[#e81123] transition-colors duration-100"
        >
          <X className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}
