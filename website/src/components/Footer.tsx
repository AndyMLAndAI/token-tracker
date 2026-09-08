"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AppLogo } from "@/components/ui/AppLogo"
import { ShieldCheck, Terminal, HardDrive } from "lucide-react"

export function Footer() {
  const pathname = usePathname()
  if (pathname === "/adcontribution") return null

  return (
    <footer className="w-full border-t border-[#1f1f1f] bg-black text-muted-foreground py-10 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2.5">
              <AppLogo size={18} />
              <span className="font-sans font-semibold text-[13px] tracking-tight text-white">
                Token Tracker
              </span>
              <span className="text-[10px] font-mono border border-[#262626] rounded px-1.5 py-0.5 text-[#888888]">
                v1.8
              </span>
            </div>
            <p className="text-xs text-[#888888] max-w-sm leading-relaxed">
              Exact local token and cost tracking for agentic coding workflows.
              100% offline, zero cloud telemetry, instant session attribution.
            </p>
            <div className="flex items-center space-x-4 text-[11px] text-[#666666] pt-1">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
                Zero Cloud Telemetry
              </span>
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-[#06b6d4]" />
                SQLite Local Storage
              </span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white font-mono">
              Product
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Overview
                </Link>
              </li>
              <li>
                <Link href="/download" className="hover:text-white transition-colors">
                  Download Windows (.exe)
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Architecture &amp; Privacy
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Supported Tools */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white font-mono">
              Supported Tools
            </h4>
            <ul className="space-y-1.5 text-xs text-[#777777]">
              <li>Claude Code CLI</li>
              <li>Google Antigravity</li>
              <li>Cursor Composer &amp; Chat</li>
              <li>Windsurf Cascades</li>
              <li>Cline &amp; Roo Code</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#1a1a1a] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#666666] gap-2">
          <span>Token Tracker v1.8.0. Local-first software for developers.</span>
          <span className="font-mono text-[#555555]">WCAG AA Compliant &bull; No Telemetry</span>
        </div>
      </div>
    </footer>
  )
}
