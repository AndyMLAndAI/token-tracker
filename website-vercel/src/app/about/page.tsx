"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import {
  CheckCircle2,
  Lock,
  Download,
  FolderGit2,
  HardDrive,
  Cpu,
  Layers,
} from "lucide-react"

export default function AboutPage() {
  const pipelineSteps = [
    {
      step: "01",
      title: "File System Event Observers",
      desc: "Chokidar and low-overhead OS file watchers monitor known tool directories (%USERPROFILE%\\.claude, AppData\\Cursor, .gemini\\antigravity, etc.) for write activity.",
    },
    {
      step: "02",
      title: "Incremental Streaming Parsing",
      desc: "Parsers read new entries via byte-offset cursors, avoiding re-reading entire gigabyte-scale JSONL log files or locking active SQLite WAL databases.",
    },
    {
      step: "03",
      title: "Local SQLite Aggregation",
      desc: "Records are ingested into a local SQLite database (%APPDATA%\\token_tracker\\token_tracker.db) with indexed project tags and denormalized daily summaries.",
    },
    {
      step: "04",
      title: "Reactive Desktop UI & Budget Alerts",
      desc: "Electron IPC events broadcast data updates to the React interface, while the background budget engine checks thresholds and sends native OS notifications.",
    },
  ]

  const provenanceTypes = [
    {
      badge: "Exact",
      badgeVariant: "emerald" as const,
      name: "Exact Provider Usage",
      source: "Claude Code, Antigravity, Cline, Direct APIs",
      description:
        "Extracted directly from API response usage blocks (input_tokens, output_tokens, cache_read_input_tokens, cache_creation_input_tokens). 100% precision with exact provider invoice parity.",
    },
    {
      badge: "Estimated",
      badgeVariant: "default" as const,
      name: "Local BPE Calculation",
      source: "Cursor Chat, Windsurf Cascades, Raw Markdown",
      description:
        "When an IDE only persists conversation text without token usage metadata, Token Tracker runs local BPE tokenizers (js-tiktoken using cl100k_base or o200k_base encodings) to compute accurate estimates entirely offline.",
    },
    {
      badge: "Captured",
      badgeVariant: "manilla" as const,
      name: "Loopback Proxy Interception",
      source: "Custom inference routing, Local proxy",
      description:
        "Captured in real-time by routing developer tools through a lightweight local loopback proxy (127.0.0.1) that snoops response stream trailers without modifying or delaying request payloads.",
    },
  ]

  return (
    <div className="w-full max-w-[1280px] px-4 sm:px-8 py-16 sm:py-24 space-y-16">
      {/* 1. Page Header */}
      <div className="space-y-4 pb-8 border-b border-[#cccbc8]">
        <div className="flex items-center gap-2">
          <Badge variant="manilla" className="text-xs font-mono py-1 px-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] mr-1.5" />
            Architecture &amp; Design Principles
          </Badge>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight text-[#141413]">
          About Token Tracker
        </h1>

        <p className="font-serif text-[20px] text-[#57564f] max-w-3xl leading-[1.6]">
          A local-first telemetry workstation engineered to give developers granular, project-level visibility into AI spending across agentic IDEs and CLI tools.
        </p>
      </div>

      {/* 2. Core Pillar: Local-First & Zero Telemetry (Featured Manilla Tone Shift) */}
      <div className="rounded-[24px] border border-[#cccbc8] bg-[#f5e3c7] p-8 sm:p-12 space-y-6">
        <div className="flex items-start sm:items-center space-x-4">
          <div className="w-12 h-12 rounded-[12px] bg-[#faf9f5] border border-[#d8cebe] flex items-center justify-center text-[#141413] shrink-0">
            <Lock className="w-6 h-6 text-[#141413]" />
          </div>
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#141413]">
              Local-First &amp; Privacy-Preserving
            </h2>
            <p className="font-mono text-xs text-[#57564f] mt-1">
              No accounts &bull; No remote servers &bull; Zero cloud telemetry
            </p>
          </div>
        </div>

        <p className="font-serif text-[18px] text-[#141413] leading-relaxed">
          Your source code, prompt contents, and file paths represent critical intellectual property. Token Tracker was designed from day one with a strict zero-cloud architecture:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="p-5 rounded-[16px] bg-[#faf9f5] border border-[#d8cebe] space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold font-sans text-[#141413]">
              <CheckCircle2 className="w-4 h-4 text-[#065f46] shrink-0" />
              <span>100% Local Processing</span>
            </div>
            <p className="font-sans text-xs text-[#57564f] leading-relaxed">
              Ingestion parsers, cost calculators, and SQLite storage run entirely on your workstation CPU.
            </p>
          </div>

          <div className="p-5 rounded-[16px] bg-[#faf9f5] border border-[#d8cebe] space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold font-sans text-[#141413]">
              <CheckCircle2 className="w-4 h-4 text-[#065f46] shrink-0" />
              <span>Zero Remote Telemetry</span>
            </div>
            <p className="font-sans text-xs text-[#57564f] leading-relaxed">
              Contains no analytics SDKs, external logging endpoints, or phone-home beacons of any kind.
            </p>
          </div>

          <div className="p-5 rounded-[16px] bg-[#faf9f5] border border-[#d8cebe] space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold font-sans text-[#141413]">
              <CheckCircle2 className="w-4 h-4 text-[#065f46] shrink-0" />
              <span>Offline Operational</span>
            </div>
            <p className="font-sans text-xs text-[#57564f] leading-relaxed">
              Functions completely without internet connectivity. Built for air-gapped and secure environments.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Technical Pipeline: How It Works */}
      <div className="space-y-8 pt-4">
        <div className="space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#141413]">
            How Token Tracker Works
          </h2>
          <p className="font-sans text-sm text-[#57564f]">
            Automated ingestion flow from local disk files to interactive dashboard without modifying your developer environment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pipelineSteps.map((item) => (
            <div
              key={item.step}
              className="rounded-[24px] border border-[#cccbc8] bg-[#faf9f5] p-6 sm:p-8 space-y-3"
            >
              <span className="font-mono text-xs font-bold text-[#141413] bg-[#e3dacc] px-2.5 py-1 rounded-full inline-block">
                PIPELINE {item.step}
              </span>
              <h3 className="font-serif text-lg font-semibold text-[#141413]">
                {item.title}
              </h3>
              <p className="font-sans text-sm text-[#57564f] leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Provenance Metadata Explained */}
      <div className="space-y-8 pt-8 border-t border-[#cccbc8]">
        <div className="space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#141413]">
            Exact vs. Estimated Provenance
          </h2>
          <p className="font-sans text-sm text-[#57564f]">
            Different coding assistants persist session data in different formats. Token Tracker explicitly categorizes all records into three clear provenance tiers:
          </p>
        </div>

        <div className="space-y-4">
          {provenanceTypes.map((prov) => (
            <div
              key={prov.name}
              className="rounded-[24px] border border-[#cccbc8] bg-[#faf9f5] p-6 sm:p-8 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-serif text-xl font-semibold text-[#141413]">
                  {prov.name}
                </h3>
                <Badge variant={prov.badgeVariant} className="text-xs font-mono">
                  {prov.badge}
                </Badge>
              </div>

              <div className="text-xs font-mono text-[#57564f]">
                Applies to: <strong className="text-[#141413]">{prov.source}</strong>
              </div>

              <p className="font-sans text-sm text-[#57564f] leading-relaxed">
                {prov.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Final Call to Action with Single Primary Emerald CTA on this page */}
      <div className="rounded-[24px] border border-[#cccbc8] bg-[#e3dacc] p-8 sm:p-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#141413]">
            Get Started with Token Tracker
          </h3>
          <p className="font-sans text-sm text-[#57564f]">
            Install the desktop app and inspect your local session logs in under two minutes.
          </p>
        </div>

        <Button asChild variant="emerald" size="lg" className="shrink-0 w-full sm:w-auto">
          <Link href="/download" className="flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            <span>Download for Windows</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
