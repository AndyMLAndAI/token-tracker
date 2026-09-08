"use client"

import React, { useEffect, useState } from "react"

interface AdUnitProps {
  adKey: string
  width: number
  height: number
  label?: string
  className?: string
  compact?: boolean
}

export function AdUnit({
  adKey,
  width,
  height,
  label = "Sponsored",
  className = "",
  compact = false,
}: AdUnitProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Raw HTML doc for complete script and atOptions execution isolation
  const htmlDoc = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      * { box-sizing: border-box; }
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    </style>
  </head>
  <body>
    <script type="text/javascript">
      atOptions = {
        'key' : '${adKey}',
        'format' : 'iframe',
        'height' : ${height},
        'width' : ${width},
        'params' : {}
      };
    </script>
    <script type="text/javascript" src="https://www.highrevenueformat.com/${adKey}/invoke.js"></script>
  </body>
</html>`

  return (
    <div
      className={`rounded-xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm shadow-xl shadow-black/20 ${
        compact ? "p-2 sm:p-2.5" : "p-3 sm:p-4"
      } ${className}`}
    >
      {/* Ad Chrome Header */}
      <div
        className={`flex items-center justify-between border-b border-zinc-800/60 text-[10px] uppercase tracking-wider text-zinc-500 font-medium ${
          compact ? "pb-1.5 mb-1.5" : "pb-2 mb-2"
        }`}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
          <span>{label}</span>
        </div>
        <span className="text-[9px] text-zinc-600 font-mono">
          {width} × {height}
        </span>
      </div>

      {/* Ad Content Container with horizontal scroll safety for smaller viewports */}
      <div className="w-full flex items-center justify-center overflow-x-auto scrollbar-none">
        <div
          style={{ width: `${width}px`, height: `${height}px` }}
          className="shrink-0 flex items-center justify-center relative"
        >
          {mounted ? (
            <iframe
              srcDoc={htmlDoc}
              width={width}
              height={height}
              title={`Advertisement ${width}x${height}`}
              className="border-0 overflow-hidden block"
              scrolling="no"
              loading="lazy"
            />
          ) : (
            <div
              style={{ width: `${width}px`, height: `${height}px` }}
              className="bg-zinc-800/20 rounded border border-zinc-800/40 animate-pulse flex items-center justify-center text-xs text-zinc-600"
            >
              Loading sponsor...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
