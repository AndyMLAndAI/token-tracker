"use client"

import React from "react"
import Link from "next/link"
import { AppLogo } from "@/components/ui/AppLogo"
import { ShieldCheck, HardDrive } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full bg-[#141413] text-[#faf9f5] py-16 mt-auto border-t border-[#262624]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#262624]">
          {/* Col 1: Brand & Purpose (6 cols) */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center space-x-3">
              <AppLogo size={22} className="brightness-110" />
              <span className="font-sans font-bold text-[16px] tracking-tight text-white">
                Token Tracker
              </span>
              <span className="text-[11px] font-mono border border-[#383835] bg-[#222220] rounded px-2 py-0.5 text-[#b0aea5]">
                v1.8.0
              </span>
            </div>
            <p className="font-serif text-[17px] text-[#cccbc8] max-w-md leading-relaxed">
              Exact local token and cost tracking for agentic coding workflows.
              100% offline, zero cloud telemetry, instant session attribution.
            </p>
            <div className="flex flex-wrap items-center gap-5 text-xs text-[#b0aea5] pt-2 font-sans">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#10b981]" />
                Zero Cloud Telemetry
              </span>
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-[#cccbc8]" />
                Local SQLite Storage
              </span>
            </div>
          </div>

          {/* Col 2: Navigation (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#b0aea5] font-mono">
              Product
            </h4>
            <ul className="space-y-2 text-sm font-sans">
              <li>
                <Link href="/" className="text-[#faf9f5] hover:text-[#10b981] transition-colors underline-offset-4 hover:underline">
                  Overview
                </Link>
              </li>
              <li>
                <Link href="/download" className="text-[#faf9f5] hover:text-[#10b981] transition-colors underline-offset-4 hover:underline">
                  Download Windows (.exe)
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[#faf9f5] hover:text-[#10b981] transition-colors underline-offset-4 hover:underline">
                  Architecture &amp; Privacy
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Supported Tools (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#b0aea5] font-mono">
              Supported Environments
            </h4>
            <ul className="space-y-1.5 text-xs text-[#b0aea5] font-sans">
              <li>Claude Code CLI</li>
              <li>Google Antigravity</li>
              <li>Cursor Composer &amp; Chat</li>
              <li>Windsurf Cascades</li>
              <li>Cline &amp; Roo Code</li>
              <li>Aider CLI</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#b0aea5] gap-3 font-sans">
          <span>Token Tracker &mdash; Local-first software for developers.</span>
          <span className="font-mono text-[#888884]">
            WCAG AA Compliant &bull; 100% Offline Operational
          </span>
        </div>
      </div>
    </footer>
  )
}
