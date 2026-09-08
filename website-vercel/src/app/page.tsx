"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import {
  Download,
  ArrowRight,
  FileCheck2,
  Cpu,
  Bell,
  FolderGit2,
  ShieldCheck,
  HardDrive,
  Activity,
} from "lucide-react"

export default function HomePage() {
  const supportedTools = [
    { name: "Claude Code CLI", type: "JSONL Streaming Logs", status: "Exact Tokens", note: "~/.claude/projects" },
    { name: "Google Antigravity", type: "Transcript Event Logs", status: "Exact Tokens", note: ".gemini/antigravity/brain" },
    { name: "Cline & Roo Code", type: "Task State Files", status: "Exact Tokens", note: "VS Code globalStorage" },
    { name: "Cursor IDE", type: "SQLite State Databases", status: "Local Estimates", note: "state.vscdb / BPE cl100k" },
    { name: "Windsurf Cascades", type: "Global App Storage", status: "Local Estimates", note: "Cascade task stores" },
    { name: "Aider CLI", type: "History Markdown Logs", status: "Exact Tokens", note: ".aider.chat.history.md" },
  ]

  return (
    <div className="w-full flex flex-col items-center">
      {/* 1. HERO SECTION (1280px max, 80-120px section gap) */}
      <section className="w-full max-w-[1280px] px-4 sm:px-8 pt-16 sm:pt-24 pb-20 sm:pb-28">
        {/* Release Status Badge */}
        <div className="flex items-center gap-2 mb-8">
          <Badge variant="manilla" className="text-xs font-mono py-1 px-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] mr-1.5" />
            Release v1.8.0 &bull; 100% Local &bull; Zero Cloud Telemetry
          </Badge>
        </div>

        {/* Display Title in Lora 68px */}
        <h1 className="font-serif text-5xl sm:text-[68px] font-semibold tracking-[-0.02em] leading-[1.08] text-[#141413] mb-8 max-w-4xl">
          Token Tracker
        </h1>

        {/* Two-Column Hero: 61px Geist Sans Bold vs 20px Lora Editorial Paragraph */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start pb-10 border-b border-[#cccbc8]">
          <div className="lg:col-span-7">
            <h2 className="font-sans text-3xl sm:text-[46px] lg:text-[61px] font-bold tracking-[-0.025em] leading-[1.06] text-[#141413]">
              Exact local token and cost tracking, attributed per project.
            </h2>
          </div>

          <div className="lg:col-span-5 space-y-6 pt-2">
            <p className="font-serif text-[20px] text-[#57564f] leading-[1.65] font-normal">
              Purpose-built for agentic engineering workflows. Ingests local developer session files directly from Claude Code, Antigravity, Cursor, and Cline without sending a single byte to external servers.
            </p>

            {/* Single Primary Emerald CTA for the page */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Button asChild variant="emerald" size="lg" className="w-full sm:w-auto">
                <a
                  href={process.env.NEXT_PUBLIC_DOWNLOAD_URL || "https://github.com/AndyMLAndAI/token-tracker/releases/download/v1.8.0/Token-Tracker-Setup-1.8.exe"}
                  className="flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download for Windows (.exe)</span>
                </a>
              </Button>

              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/about" className="flex items-center justify-center gap-2">
                  <span>How It Works</span>
                  <ArrowRight className="w-4 h-4 text-[#57564f]" />
                </Link>
              </Button>
            </div>

            <div className="font-mono text-[11px] text-[#57564f] flex flex-wrap items-center gap-2 pt-1">
              <span>Windows 10 / 11 (64-bit)</span>
              <span>&bull;</span>
              <span>Authentic Win95 Setup Wizard</span>
              <span>&bull;</span>
              <span>~263 MB Standalone Binary</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DASHBOARD PREVIEW MOCKUP & LIVE TELEMETRY LEDGER */}
      <section className="w-full max-w-[1280px] px-4 sm:px-8 pb-20 sm:pb-28">
        {/* Parchment Window Chrome — Flat tone shift, no drop shadow */}
        <div className="rounded-[24px] border border-[#cccbc8] bg-[#faf9f5] overflow-hidden">
          {/* Mock Window Titlebar in Oat Warm */}
          <div className="h-11 bg-[#e3dacc] border-b border-[#cccbc8] px-5 flex items-center justify-between select-none">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#cccbc8] border border-[#b0aea5]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#cccbc8] border border-[#b0aea5]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#cccbc8] border border-[#b0aea5]" />
              <span className="text-[12px] font-mono text-[#57564f] ml-2 font-medium">
                Token Tracker &mdash; Desktop Telemetry &amp; Expense Console
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono bg-[#f0eee6] text-[#065f46] border border-[#cccbc8]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                Live Ingestion Active
              </span>
            </div>
          </div>

          {/* Screenshot Image Container */}
          <div className="relative w-full aspect-[16/10] bg-[#141413]">
            <Image
              src="/dashboard-preview.png"
              alt="Token Tracker Dashboard Interface Preview"
              fill
              className="object-cover object-top"
              priority
            />
          </div>
        </div>

        {/* Telemetry Metric Ledger — Flat Tone Shift Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="rounded-[24px] border border-[#cccbc8] bg-[#faf9f5] p-6 flex flex-col justify-between">
            <span className="text-xs font-mono text-[#57564f] uppercase tracking-wider font-semibold">
              Tokens Tracked
            </span>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="font-mono text-2xl sm:text-3xl font-bold text-[#141413] tabular-nums">
                2,841,920
              </span>
              <span className="text-[11px] font-mono text-[#065f46] font-medium bg-[#10b981]/15 px-2 py-0.5 rounded-full">
                100% Local
              </span>
            </div>
          </div>

          <div className="rounded-[24px] border border-[#cccbc8] bg-[#faf9f5] p-6 flex flex-col justify-between">
            <span className="text-xs font-mono text-[#57564f] uppercase tracking-wider font-semibold">
              Spend Monitored
            </span>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="font-mono text-2xl sm:text-3xl font-bold text-[#141413] tabular-nums">
                $34.18
              </span>
              <span className="text-[11px] font-mono text-[#57564f] bg-[#e3dacc] px-2 py-0.5 rounded-full">
                Under Budget
              </span>
            </div>
          </div>

          <div className="rounded-[24px] border border-[#cccbc8] bg-[#faf9f5] p-6 flex flex-col justify-between">
            <span className="text-xs font-mono text-[#57564f] uppercase tracking-wider font-semibold">
              Ingested Sources
            </span>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="font-mono text-2xl sm:text-3xl font-bold text-[#141413] tabular-nums">
                6 Tools
              </span>
              <span className="text-[11px] font-mono text-[#141413] bg-[#f5e3c7] px-2 py-0.5 rounded-full">
                Auto-Watch
              </span>
            </div>
          </div>

          <div className="rounded-[24px] border border-[#cccbc8] bg-[#faf9f5] p-6 flex flex-col justify-between">
            <span className="text-xs font-mono text-[#57564f] uppercase tracking-wider font-semibold">
              Network Telemetry
            </span>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="font-mono text-2xl sm:text-3xl font-bold text-[#141413] tabular-nums">
                0 Bytes
              </span>
              <span className="text-[11px] font-mono text-[#065f46] font-medium bg-[#10b981]/15 px-2 py-0.5 rounded-full">
                Offline Only
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ARCHITECTURE & CORE FEATURES (Varied Asymmetric Grid, No Identical Cards) */}
      <section className="w-full max-w-[1280px] px-4 sm:px-8 py-20 sm:py-28 border-t border-[#cccbc8]">
        <div className="max-w-3xl mb-12 space-y-3">
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#141413]">
            Architected for Exact Local Visibility
          </h2>
          <p className="font-sans text-[17px] text-[#57564f] leading-relaxed">
            Provider dashboards only show organization-wide monthly totals. Token Tracker attributes every prompt, completion, and cache read to the local project and task that generated it.
          </p>
        </div>

        {/* Asymmetric 4-card composition */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Featured Wide Card: Manilla #f5e3c7 */}
          <Card surface="manilla" className="md:col-span-8 flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-center justify-between pb-2">
                <div className="w-10 h-10 rounded-[8px] bg-[#faf9f5] border border-[#d8cebe] flex items-center justify-center text-[#141413]">
                  <FolderGit2 className="w-5 h-5 text-[#141413]" />
                </div>
                <Badge variant="default" className="text-xs font-mono">
                  Granular Attribution
                </Badge>
              </div>
              <CardTitle className="text-2xl pt-2">
                Per-Project &amp; Per-Chat Breakdown
              </CardTitle>
              <CardDescription className="text-base text-[#57564f]">
                Every token and cent is attributed to the exact repository folder or conversation thread, ending the mystery of single blended monthly API invoices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-[16px] bg-[#faf9f5] border border-[#d8cebe] space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-[#57564f] pb-1 border-b border-[#e3dacc]">
                  <span>REPOSITORY PROJECT</span>
                  <span>CACHE READ</span>
                  <span>INPUT / OUTPUT</span>
                  <span>RECORDED SPEND</span>
                </div>
                <div className="flex items-center justify-between text-[#141413] font-medium pt-1">
                  <span>~/AI/Token_Tracker</span>
                  <span className="text-[#065f46]">420,192 tok</span>
                  <span>1.24M / 182k</span>
                  <span className="font-bold">$14.28</span>
                </div>
                <div className="flex items-center justify-between text-[#57564f]">
                  <span>~/Projects/backend-api</span>
                  <span className="text-[#065f46]">180,450 tok</span>
                  <span>620k / 94k</span>
                  <span className="font-bold text-[#141413]">$8.40</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Provenance */}
          <Card surface="light" className="md:col-span-4 flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-center justify-between pb-2">
                <div className="w-10 h-10 rounded-[8px] bg-[#f0eee6] border border-[#cccbc8] flex items-center justify-center text-[#141413]">
                  <FileCheck2 className="w-5 h-5 text-[#141413]" />
                </div>
                <Badge variant="outline" className="text-xs font-mono">
                  Audit Verified
                </Badge>
              </div>
              <CardTitle className="text-xl pt-2">
                Verified Data Provenance
              </CardTitle>
              <CardDescription>
                Transparently distinguishes between exact provider response tokens, local BPE calculations (js-tiktoken), and loopback proxy captures with audit badges.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-3.5 rounded-[12px] bg-[#f0eee6] border border-[#cccbc8] space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[#141413] font-medium">Exact Provider</span>
                  <span className="text-[#065f46] font-semibold">100% Invoice Parity</span>
                </div>
                <div className="flex items-center justify-between text-[#57564f]">
                  <span>BPE Estimated</span>
                  <span>Offline Tokenizer</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Multi-Source Local Ingestion */}
          <Card surface="light" className="md:col-span-6 flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-center justify-between pb-2">
                <div className="w-10 h-10 rounded-[8px] bg-[#f0eee6] border border-[#cccbc8] flex items-center justify-center text-[#141413]">
                  <Cpu className="w-5 h-5 text-[#141413]" />
                </div>
                <Badge variant="outline" className="text-xs font-mono">
                  Autonomous Watchers
                </Badge>
              </div>
              <CardTitle className="text-xl pt-2">
                Multi-Source Local Ingestion
              </CardTitle>
              <CardDescription>
                Native file system watchers monitor Claude Code JSONL logs, Google Antigravity transcripts, Cursor state databases, and Cline/Roo Code task stores.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px] text-[#57564f]">
                <span className="px-2.5 py-1 rounded bg-[#f0eee6] border border-[#cccbc8]">JSONL Byte Offsets</span>
                <span className="px-2.5 py-1 rounded bg-[#f0eee6] border border-[#cccbc8]">SQLite WAL Safe</span>
                <span className="px-2.5 py-1 rounded bg-[#f0eee6] border border-[#cccbc8]">Zero IDE Locks</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Budget Thresholds in Oat Warm */}
          <Card surface="oat" className="md:col-span-6 flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-center justify-between pb-2">
                <div className="w-10 h-10 rounded-[8px] bg-[#faf9f5] border border-[#cccbc8] flex items-center justify-center text-[#141413]">
                  <Bell className="w-5 h-5 text-[#141413]" />
                </div>
                <Badge variant="default" className="text-xs font-mono bg-[#faf9f5]">
                  Spend Control
                </Badge>
              </div>
              <CardTitle className="text-xl pt-2">
                Budget Thresholds &amp; Alerts
              </CardTitle>
              <CardDescription className="text-[#57564f]">
                Configure custom daily, weekly, or monthly spend limits globally and per project. Evaluated on ingestion with native OS background notifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-[12px] bg-[#faf9f5] border border-[#cccbc8] flex items-center justify-between text-xs font-mono">
                <span className="text-[#141413] font-medium">Daily Limit Warning @ 80%</span>
                <span className="text-[#065f46] font-semibold">Native Desktop Alert</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 4. COMPATIBILITY MATRIX */}
      <section className="w-full max-w-[1280px] px-4 sm:px-8 py-20 sm:py-28 border-t border-[#cccbc8]">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="space-y-2">
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#141413]">
              Supported Agentic Coding Tools
            </h2>
            <p className="font-sans text-[17px] text-[#57564f]">
              Automatically discovered on your machine with zero configuration required.
            </p>
          </div>
          <span className="text-xs font-mono text-[#57564f]">
            Local disk detection &bull; No API tokens requested
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {supportedTools.map((tool) => (
            <div
              key={tool.name}
              className="rounded-[24px] border border-[#cccbc8] bg-[#faf9f5] p-6 flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-[#141413]">
                    {tool.name}
                  </h3>
                  <p className="text-xs font-mono text-[#57564f] mt-1">
                    {tool.type}
                  </p>
                </div>
                <Badge
                  variant={tool.status === "Exact Tokens" ? "emerald" : "default"}
                  className="text-[10px] font-mono shrink-0"
                >
                  {tool.status}
                </Badge>
              </div>

              <div className="pt-2 border-t border-[#e3dacc] text-[11px] font-mono text-[#57564f] flex items-center justify-between">
                <span>Location:</span>
                <span className="text-[#141413]">{tool.note}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CLOSING CONVERSION PANEL (Manilla Tone Shift) */}
      <section className="w-full max-w-[1280px] px-4 sm:px-8 pb-24 sm:pb-32">
        <div className="rounded-[24px] border border-[#cccbc8] bg-[#f5e3c7] p-8 sm:p-14 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-3">
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#141413]">
              Ready to audit your agentic engineering spending?
            </h2>
            <p className="font-sans text-[17px] text-[#57564f] leading-relaxed">
              Download the single portable installer for Windows. No account registration, no credit card, no cloud dependencies.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full lg:w-auto">
            <Button asChild variant="default" size="lg" className="w-full sm:w-auto">
              <Link href="/download" className="flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                <span>Get Token Tracker v1.8</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto bg-[#faf9f5]">
              <Link href="/about" className="flex items-center justify-center gap-2">
                <span>Read Architecture</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
