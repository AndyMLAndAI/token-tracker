"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import {
  Download,
  Check,
  ShieldCheck,
  HardDrive,
  Monitor,
  ExternalLink,
  Cpu,
} from "lucide-react"

export default function DownloadPage() {
  const steps = [
    {
      num: "01",
      title: "Download Installer Executable",
      desc: "Save Token-Tracker-Setup-1.8.exe to your local machine (~263 MB standalone portable installer).",
    },
    {
      num: "02",
      title: "Run Windows 95 Setup Wizard",
      desc: "Execute the setup program. Follow the authentic beveled Win95 wizard to select your install path (%LOCALAPPDATA% by default).",
    },
    {
      num: "03",
      title: "Automatic Discovery & Ingestion",
      desc: "Shortcuts are placed on your Desktop and Start Menu. Launch Token Tracker to immediately index Claude Code and Antigravity logs.",
    },
  ]

  const requirements = [
    { label: "Operating System", value: "Windows 10 / Windows 11 (64-bit x64 architecture)" },
    { label: "Disk Space Required", value: "~460 MB for runtime, packaged Electron core, and SQLite database" },
    { label: "Memory (RAM)", value: "4 GB minimum (8 GB recommended for live watcher concurrency)" },
    { label: "Network Access", value: "None required — 100% offline local operation" },
    { label: "Supported Tools", value: "Claude Code CLI, Google Antigravity, Cursor, Windsurf, Cline, Roo Code" },
  ]

  return (
    <div className="w-full max-w-[1280px] px-4 sm:px-8 py-16 sm:py-24 space-y-16">
      {/* 1. Header Section */}
      <div className="space-y-4 pb-8 border-b border-[#cccbc8]">
        <div className="flex items-center gap-2">
          <Badge variant="manilla" className="text-xs font-mono py-1 px-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] mr-1.5" />
            Official Release &bull; Version 1.8.0
          </Badge>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight text-[#141413]">
          Download Token Tracker
        </h1>

        <p className="font-serif text-[20px] text-[#57564f] max-w-3xl leading-[1.6]">
          Install the desktop application on your workstation to start indexing and auditing your local AI token usage with exact project attribution.
        </p>
      </div>

      {/* 2. Primary Installer & Platforms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Primary Download Card (Windows) — 8 columns */}
        <div className="lg:col-span-8 rounded-[24px] border border-[#cccbc8] bg-[#faf9f5] p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-[#57564f]">
                <Monitor className="w-4 h-4 text-[#141413]" />
                <span className="font-semibold text-[#141413]">Windows 64-bit</span>
              </div>
              <Badge variant="default" className="text-xs font-mono bg-[#e3dacc]">
                Official Binary
              </Badge>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#141413]">
              Token Tracker for Windows
            </h2>

            <p className="font-sans text-[15px] text-[#57564f] leading-relaxed">
              Single standalone portable installer with authentic Windows 95 setup interface and Windows Add/Remove Programs integration.
            </p>
          </div>

          {/* Download Action Box (Manilla Tone Shift) */}
          <div className="p-5 rounded-[16px] bg-[#f5e3c7] border border-[#d8cebe] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="font-mono text-sm font-bold text-[#141413]">
                Token-Tracker-Setup-1.8.exe
              </div>
              <div className="text-xs font-mono text-[#57564f] mt-1">
                Version 1.8.0 &bull; Size: 263.4 MB &bull; Portable Package (x64)
              </div>
            </div>

            {/* Single primary Emerald CTA on this page */}
            <Button asChild variant="emerald" size="lg" className="w-full sm:w-auto shrink-0">
              <a
                href={process.env.NEXT_PUBLIC_DOWNLOAD_URL || "https://github.com/AndyMLAndAI/token-tracker/releases/download/v1.8.0/Token-Tracker-Setup-1.8.exe"}
                className="flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Installer (.exe)</span>
              </a>
            </Button>
          </div>

          {/* Verification & Security Badges */}
          <div className="pt-2 border-t border-[#e3dacc] flex flex-wrap items-center justify-between gap-3 text-xs text-[#57564f] font-mono">
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-[#141413]" />
              <span className="text-[#141413]">Hosted on GitHub Releases</span>
              <span>&bull;</span>
              <span>SHA-256 Verified</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#065f46]" />
                No Admin Needed
              </span>
              <span className="flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-[#141413]" />
                Offline SQLite
              </span>
            </div>
          </div>
        </div>

        {/* Secondary Platforms Card — 4 columns */}
        <div className="lg:col-span-4 rounded-[24px] border border-[#cccbc8] bg-[#e3dacc] p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-[#57564f] font-semibold">
              Cross-Platform
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#141413]">
              macOS &amp; Linux
            </h3>
            <p className="font-sans text-sm text-[#57564f] leading-relaxed">
              Native packages for Darwin (Apple Silicon / Intel) and Linux (.deb / AppImage) are currently in active development.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-[12px] bg-[#faf9f5] border border-[#cccbc8] flex items-center justify-between">
              <span className="text-xs font-sans font-medium text-[#141413]">macOS (.dmg)</span>
              <Badge variant="outline" className="text-[10px] font-mono">In Progress</Badge>
            </div>
            <div className="p-3.5 rounded-[12px] bg-[#faf9f5] border border-[#cccbc8] flex items-center justify-between">
              <span className="text-xs font-sans font-medium text-[#141413]">Linux (.deb / AppImage)</span>
              <Badge variant="outline" className="text-[10px] font-mono">In Progress</Badge>
            </div>
          </div>

          <p className="text-xs font-mono text-[#57564f] pt-2 border-t border-[#cccbc8]">
            Ingestion engine and SQLite schema run identically across all platforms.
          </p>
        </div>
      </div>

      {/* 3. Installation Steps */}
      <div className="space-y-6 pt-6">
        <div className="space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#141413]">
            Installation Steps
          </h2>
          <p className="font-sans text-sm text-[#57564f]">
            Three straightforward steps to run Token Tracker on Windows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="rounded-[24px] border border-[#cccbc8] bg-[#faf9f5] p-6 sm:p-8 space-y-3"
            >
              <span className="font-mono text-xs font-bold text-[#141413] bg-[#e3dacc] px-2.5 py-1 rounded-full inline-block">
                STEP {step.num}
              </span>
              <h3 className="font-serif text-lg font-semibold text-[#141413] pt-1">
                {step.title}
              </h3>
              <p className="font-sans text-sm text-[#57564f] leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. System Requirements Table */}
      <div className="space-y-6 pt-6">
        <div className="space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#141413]">
            System Requirements
          </h2>
          <p className="font-sans text-sm text-[#57564f]">
            Verified hardware and runtime dependencies.
          </p>
        </div>

        <div className="rounded-[24px] border border-[#cccbc8] bg-[#faf9f5] divide-y divide-[#e3dacc] overflow-hidden">
          {requirements.map((req) => (
            <div
              key={req.label}
              className="p-4 sm:p-5 px-6 flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm gap-2"
            >
              <span className="font-sans font-medium text-[#141413] sm:w-56 shrink-0">
                {req.label}
              </span>
              <span className="font-mono text-[#57564f] sm:text-right">
                {req.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
