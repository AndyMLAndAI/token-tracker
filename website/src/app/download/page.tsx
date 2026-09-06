import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import {
  Download,
  Check,
  ShieldCheck,
  HardDrive,
  Cpu,
  Monitor,
  Terminal,
  ExternalLink,
  Info,
  Clock,
} from "lucide-react"

export default function DownloadPage() {
  const steps = [
    {
      num: "01",
      title: "Download Installer Executable",
      desc: "Save Token-Tracker-Setup-1.7.exe to your local machine (~263 MB portable installer).",
    },
    {
      num: "02",
      title: "Run Windows 95 Setup Wizard",
      desc: "Execute the setup program. Follow the beveled Win95 wizard to select your install path (%LOCALAPPDATA% by default).",
    },
    {
      num: "03",
      title: "Automatic Discovery & Ingestion",
      desc: "Shortcuts are placed on your Desktop and Start Menu. Launch Token Tracker to immediately detect existing Claude Code and Antigravity logs.",
    },
  ]

  const requirements = [
    { label: "Operating System", value: "Windows 10 / Windows 11 (64-bit x64 architecture)" },
    { label: "Disk Space Required", value: "~460 MB for runtime, packaged electron core, and SQLite database" },
    { label: "Memory (RAM)", value: "4 GB minimum (8 GB recommended for live watcher concurrency)" },
    { label: "Network Access", value: "None required — 100% offline local operation" },
    { label: "Supported Tools", value: "Claude Code CLI, Google Antigravity, Cursor, Windsurf, Cline, Roo Code" },
  ]

  return (
    <div className="flex flex-col items-center w-full py-12 px-4 sm:px-6">
      <div className="max-w-4xl w-full space-y-10">
        {/* Header */}
        <div className="space-y-3 text-center sm:text-left border-b border-[#1f1f1f] pb-8">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-[#262626] bg-[#0c0c0c] text-xs text-[#a1a1aa] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            <span>Latest Release &bull; Version 1.7.0</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-sans font-bold tracking-tight text-white">
            Download Token Tracker
          </h1>
          <p className="text-sm text-[#8c8c8c] max-w-2xl leading-relaxed">
            Install the desktop application on your workstation to start indexing and auditing your local AI token usage with exact project attribution.
          </p>
        </div>

        {/* PRIMARY DOWNLOAD CARD (WINDOWS) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border-[#262626] bg-[#0a0a0a] shadow-lg">
            <CardHeader className="space-y-2 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Monitor className="w-4 h-4 text-[#10b981]" />
                  <span className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa]">
                    Windows 64-bit
                  </span>
                </div>
                <Badge variant="emerald" className="text-[10px] font-mono">
                  Official Build
                </Badge>
              </div>
              <CardTitle className="text-2xl text-white font-sans font-bold">
                Token Tracker for Windows
              </CardTitle>
              <CardDescription className="text-xs text-[#8c8c8c]">
                Single standalone portable installer with authentic Windows 95 setup interface and Windows Add/Remove Programs integration.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="p-3.5 rounded-md bg-[#0e0e0e] border border-[#1f1f1f] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-mono text-white font-medium">Token-Tracker-Setup-1.7.exe</div>
                  <div className="text-[11px] text-[#666666] font-mono mt-0.5">
                    Version 1.7.0 &bull; Size: 263.4 MB &bull; Portable Package (x64)
                  </div>
                </div>
                <Button asChild size="lg" className="bg-white text-black font-semibold hover:bg-white/90 h-10 px-5 w-full sm:w-auto flex-shrink-0">
                  <a
                    href={process.env.NEXT_PUBLIC_DOWNLOAD_URL || "https://github.com/AndyMLAndAI/token-tracker/releases/download/v1.7.0/Token-Tracker-Setup-1.7.exe"}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Installer (.exe)</span>
                  </a>
                </Button>
              </div>

              <div className="p-2.5 rounded bg-[#09090b] border border-[#1a1a1a] flex items-center justify-between text-[11px] text-[#888888]">
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5 text-[#a1a1aa]" />
                  <span>Hosted on GitHub Releases</span>
                </div>
                <span className="font-mono text-[10px] text-[#666666]">SHA-256 Verified</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-[#71717a] font-mono">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
                  <span>No Admin Needed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#10b981]" />
                  <span>Clean Uninstaller</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-[#06b6d4]" />
                  <span>Offline SQLite Storage</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* OTHER PLATFORMS CARD */}
          <Card className="border-[#1f1f1f] bg-[#0c0c0c] flex flex-col justify-between">
            <CardHeader className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#777777]">
                Other Platforms
              </span>
              <CardTitle className="text-base text-white font-sans font-semibold">
                macOS &amp; Linux
              </CardTitle>
              <CardDescription className="text-xs text-[#71717a]">
                Native packages for Darwin (Apple Silicon / Intel) and Linux (.deb / AppImage) are currently in active development.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
              <div className="p-2.5 rounded border border-[#1a1a1a] bg-[#09090b] flex items-center justify-between">
                <span className="text-xs text-[#888888]">macOS (.dmg)</span>
                <Badge variant="muted" className="text-[10px] font-mono">Coming soon</Badge>
              </div>
              <div className="p-2.5 rounded border border-[#1a1a1a] bg-[#09090b] flex items-center justify-between">
                <span className="text-xs text-[#888888]">Linux (.deb / AppImage)</span>
                <Badge variant="muted" className="text-[10px] font-mono">Coming soon</Badge>
              </div>
            </CardContent>

            <CardFooter className="pt-0">
              <span className="text-[11px] text-[#555555] font-mono">
                Source code architecture runs identically cross-platform.
              </span>
            </CardFooter>
          </Card>
        </div>

        {/* INSTALLATION INSTRUCTIONS */}
        <div className="space-y-4 pt-4">
          <h2 className="text-lg font-sans font-semibold text-white tracking-tight">
            Installation Steps
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {steps.map((step) => (
              <div
                key={step.num}
                className="p-5 rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] space-y-2"
              >
                <div className="text-xs font-mono text-[#10b981] font-semibold tracking-wider">
                  STEP {step.num}
                </div>
                <div className="text-sm font-semibold text-white font-sans">
                  {step.title}
                </div>
                <div className="text-xs text-[#888888] leading-relaxed">
                  {step.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SYSTEM REQUIREMENTS TABLE */}
        <div className="space-y-4 pt-4 border-t border-[#1f1f1f]">
          <h2 className="text-lg font-sans font-semibold text-white tracking-tight">
            System Requirements
          </h2>
          <div className="rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] divide-y divide-[#1f1f1f] overflow-hidden">
            {requirements.map((req) => (
              <div
                key={req.label}
                className="p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1"
              >
                <span className="text-[#a1a1aa] font-medium sm:w-48 flex-shrink-0">
                  {req.label}
                </span>
                <span className="text-white font-mono text-left sm:text-right">
                  {req.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
