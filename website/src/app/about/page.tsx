import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import {
  ShieldCheck,
  HardDrive,
  Cpu,
  Layers,
  Terminal,
  FileText,
  Activity,
  ArrowRight,
  Workflow,
  CheckCircle2,
  Lock,
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
      desc: "Records are ingested into a local SQLite database (%APPDATA%\\token_tracker\\database.sqlite) with indexed project tags and denormalized daily summaries.",
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
      badgeVariant: "cyan" as const,
      name: "Local BPE Calculation",
      source: "Cursor Chat, Windsurf Cascades, Raw Markdown",
      description:
        "When an IDE only persists conversation text without token usage metadata, Token Tracker runs local BPE tokenizers (js-tiktoken using cl100k_base or o200k_base encodings) to compute accurate estimates entirely offline.",
    },
    {
      badge: "Captured",
      badgeVariant: "default" as const,
      name: "Loopback Proxy Interception",
      source: "Custom inference routing, Local proxy",
      description:
        "Captured in real-time by routing developer tools through a lightweight local loopback proxy (127.0.0.1) that snoops response stream trailers without modifying or delaying request payloads.",
    },
  ]

  return (
    <div className="flex flex-col items-center w-full py-12 px-4 sm:px-6">
      <div className="max-w-4xl w-full space-y-12">
        {/* Page Header */}
        <div className="space-y-3 text-center sm:text-left border-b border-[#1f1f1f] pb-8">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-[#262626] bg-[#0c0c0c] text-xs text-[#a1a1aa] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4]" />
            <span>Architecture &amp; Design Principles</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-sans font-bold tracking-tight text-white">
            About Token Tracker
          </h1>
          <p className="text-sm text-[#8c8c8c] max-w-2xl leading-relaxed">
            A local-first telemetry workstation engineered to give developers granular, project-level visibility into AI spending across agentic IDEs and CLI tools.
          </p>
        </div>

        {/* CORE PILLAR 1: LOCAL-FIRST & ZERO TELEMETRY */}
        <div className="rounded-xl border border-[#1f1f1f] bg-[#0a0a0a] p-6 sm:p-8 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-center text-[#10b981]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-sans font-semibold text-white">
                Local-First &amp; Privacy-Preserving
              </h2>
              <span className="text-xs text-[#71717a] font-mono">
                No accounts &bull; No remote servers &bull; No cloud telemetry
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
            Your source code, prompt contents, and file paths represent critical intellectual property. Token Tracker was designed from day one with a strict zero-cloud architecture:
          </p>
          <ul className="space-y-2 text-xs text-[#8c8c8c] pt-1">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" />
              <span><strong className="text-white">100% Local Processing:</strong> Ingestion parsers, cost calculators, and SQLite storage run entirely on your local CPU.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" />
              <span><strong className="text-white">Zero Telemetry Transmitted:</strong> The application does not contain remote tracking libraries, analytics SDKs, or external logging endpoints.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" />
              <span><strong className="text-white">Offline Operational:</strong> Functions completely without internet connectivity. Perfect for air-gapped enterprise environments.</span>
            </li>
          </ul>
        </div>

        {/* HOW IT WORKS SECTION */}
        <div className="space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-[#777777]">
              Technical Pipeline
            </span>
            <h2 className="text-xl font-sans font-bold text-white tracking-tight">
              How Token Tracker Works
            </h2>
            <p className="text-xs text-[#888888]">
              Automated ingestion flow from local disk files to interactive dashboard without modifying your developer environment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pipelineSteps.map((item) => (
              <div
                key={item.step}
                className="p-5 rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] space-y-2"
              >
                <span className="text-xs font-mono text-[#06b6d4] font-semibold tracking-wider">
                  PIPELINE {item.step}
                </span>
                <div className="text-sm font-semibold text-white font-sans">
                  {item.title}
                </div>
                <div className="text-xs text-[#8c8c8c] leading-relaxed">
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PROVENANCE METADATA EXPLAINED */}
        <div className="space-y-6 border-t border-[#1f1f1f] pt-8">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-[#777777]">
              Data Integrity
            </span>
            <h2 className="text-xl font-sans font-bold text-white tracking-tight">
              Exact vs. Estimated Provenance
            </h2>
            <p className="text-xs text-[#888888]">
              Different coding assistants persist session data in different formats. Token Tracker explicitly categorizes all records into three clear provenance tiers:
            </p>
          </div>

          <div className="space-y-3">
            {provenanceTypes.map((prov) => (
              <div
                key={prov.name}
                className="p-4 rounded-lg border border-[#1f1f1f] bg-[#0c0c0c] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white font-sans">
                    {prov.name}
                  </span>
                  <Badge variant={prov.badgeVariant} className="text-[10px] font-mono">
                    {prov.badge}
                  </Badge>
                </div>
                <div className="text-[11px] font-mono text-[#777777]">
                  Applies to: {prov.source}
                </div>
                <p className="text-xs text-[#8c8c8c] leading-relaxed">
                  {prov.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CALL TO ACTION */}
        <div className="border-t border-[#1f1f1f] pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-sans font-semibold text-white">
              Get Started with Token Tracker
            </h3>
            <p className="text-xs text-[#888888]">
              Install the desktop app and inspect your local session logs in under two minutes.
            </p>
          </div>
          <Button asChild size="lg" className="bg-white text-black font-semibold hover:bg-white/90 h-10 px-5 flex-shrink-0">
            <Link href="/download" className="flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              <span>Download for Windows</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
