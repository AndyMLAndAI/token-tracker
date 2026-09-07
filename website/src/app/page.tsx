"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useReducedMotion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/FadeIn"
import { Counter } from "@/components/motion/Counter"
import { appleEase } from "@/components/motion/animations"
import {
  Download,
  ArrowRight,
  FileCheck2,
  Cpu,
  Bell,
  FolderGit2,
} from "lucide-react"

export default function HomePage() {
  const shouldReduceMotion = useReducedMotion()

  const features = [
    {
      icon: FolderGit2,
      title: "Per-Project & Per-Chat Breakdown",
      description:
        "Every token and cent is attributed to the exact repository folder or conversation thread, ending the mystery of single blended monthly API invoices.",
      badge: "Granular Attribution",
    },
    {
      icon: FileCheck2,
      title: "Verified Data Provenance",
      description:
        "Transparently distinguishes between exact provider response tokens, local BPE calculations (js-tiktoken), and loopback proxy captures with audit badges.",
      badge: "Zero Guesswork",
    },
    {
      icon: Cpu,
      title: "Multi-Source Local Ingestion",
      description:
        "Native file system watchers monitor Claude Code JSONL logs, Google Antigravity transcripts, Cursor state databases, and Cline/Roo Code task stores.",
      badge: "Automatic Discovery",
    },
    {
      icon: Bell,
      title: "Budget Thresholds & Alerts",
      description:
        "Configure custom daily, weekly, or monthly spend limits globally and per project. Evaluated on ingestion with native OS background notifications.",
      badge: "Spend Control",
    },
  ]

  const supportedTools = [
    { name: "Claude Code CLI", type: "JSONL Streaming Logs", status: "Exact Tokens" },
    { name: "Google Antigravity", type: "Transcript Event Logs", status: "Exact Tokens" },
    { name: "Cline & Roo Code", type: "Task State Files", status: "Exact Tokens" },
    { name: "Cursor IDE", type: "SQLite State Databases", status: "Local Estimates" },
    { name: "Windsurf Cascades", type: "Global App Storage", status: "Local Estimates" },
    { name: "Aider CLI", type: "History Markdown Logs", status: "Exact Tokens" },
  ]

  return (
    <div className="flex flex-col items-center w-full">
      {/* HERO SECTION */}
      <section className="w-full pt-16 pb-14 px-4 sm:px-6 max-w-5xl flex flex-col items-center text-center space-y-6">
        {/* Status Pill */}
        <FadeIn delay={0.05} yOffset={12}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#262626] bg-[#0c0c0c] text-xs text-[#a1a1aa] transition-colors hover:border-[#3a3a3a]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            <span className="font-mono text-[11px] text-[#e4e4e7]">v1.7 Released</span>
            <span className="text-[#52525b]">&bull;</span>
            <span>100% Local &bull; Zero Cloud Telemetry</span>
          </div>
        </FadeIn>

        {/* Main Title */}
        <FadeIn delay={0.12} yOffset={16}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-sans font-bold tracking-tight text-white max-w-3xl leading-[1.1]">
            Token Tracker
          </h1>
        </FadeIn>

        {/* Value Prop */}
        <FadeIn delay={0.18} yOffset={16}>
          <p className="text-lg sm:text-xl text-[#a1a1aa] max-w-2xl font-normal leading-relaxed">
            Exact local token and cost tracking, broken down by project and chat — not just global totals.
          </p>
        </FadeIn>

        {/* Extended Subtitle */}
        <FadeIn delay={0.24} yOffset={16}>
          <p className="text-xs sm:text-sm text-[#71717a] max-w-xl leading-relaxed">
            Purpose-built for agentic engineering workflows. Ingests local developer session files directly from Claude Code, Antigravity, Cursor, and Cline without sending a single byte to external servers.
          </p>
        </FadeIn>

        {/* CTA Button Group with Spring Hover */}
        <FadeIn delay={0.3} yOffset={16}>
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <motion.div
              whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              transition={{ type: "spring", stiffness: 450, damping: 25 }}
              className="w-full sm:w-auto"
            >
              <Button asChild size="lg" className="bg-white text-black font-semibold hover:bg-white/90 w-full sm:w-auto h-11 px-6 shadow-lg shadow-white/5">
                <Link href="/download" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>Download for Windows (.exe)</span>
                </Link>
              </Button>
            </motion.div>

            <motion.div
              whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              transition={{ type: "spring", stiffness: 450, damping: 25 }}
              className="w-full sm:w-auto"
            >
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-11 px-6 border-[#262626] text-white hover:bg-[#141414] hover:border-[#383838]">
                <Link href="/about" className="flex items-center gap-2">
                  <span>How It Works</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#888888]" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </FadeIn>

        {/* Small Footnote */}
        <FadeIn delay={0.36} yOffset={10}>
          <div className="text-[11px] text-[#555555] font-mono flex items-center gap-2 pt-1">
            <span>Windows 10 / 11 (64-bit)</span>
            <span>&bull;</span>
            <span>Authentic Win95 Setup Wizard</span>
            <span>&bull;</span>
            <span>~263 MB Single Binary</span>
          </div>
        </FadeIn>
      </section>

      {/* DASHBOARD PREVIEW MOCKUP */}
      <section className="w-full max-w-5xl px-4 sm:px-6 pb-20">
        <FadeIn delay={0.1} yOffset={24} duration={0.6}>
          <motion.div
            whileHover={shouldReduceMotion ? {} : { y: -2 }}
            transition={{ duration: 0.25, ease: appleEase }}
            className="rounded-xl border border-[#1f1f1f] bg-[#09090b] shadow-2xl shadow-black/80 overflow-hidden hover:border-[#2a2a2a] transition-colors duration-200"
          >
            {/* Mock Window Titlebar */}
            <div className="h-9 bg-[#0c0c0c] border-b border-[#1f1f1f] px-3.5 flex items-center justify-between select-none">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#262626] border border-[#333333]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#262626] border border-[#333333]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#262626] border border-[#333333]" />
                <span className="text-[11px] font-mono text-[#777777] ml-2">
                  Token Tracker &mdash; Local Telemetry &amp; Expense Dashboard
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                  Live Ingestion Active
                </span>
              </div>
            </div>

            {/* Screenshot Image Container */}
            <div className="relative w-full aspect-[16/10] bg-black">
              <Image
                src="/dashboard-preview.png"
                alt="Token Tracker Dashboard Preview"
                fill
                className="object-cover object-top"
                priority
              />
            </div>
          </motion.div>
        </FadeIn>

        {/* Stylized Animated Metric Highlights under Preview */}
        <Stagger staggerDelay={0.06} delayChildren={0.15} className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <StaggerItem>
            <motion.div
              whileHover={shouldReduceMotion ? {} : { y: -3 }}
              transition={{ duration: 0.2, ease: appleEase }}
              className="rounded-lg border border-[#1f1f1f] bg-[#0c0c0c] p-4 flex flex-col justify-between hover:border-[#2d2d2d] transition-colors shadow-sm hover:shadow-md hover:shadow-black/40"
            >
              <span className="text-[11px] font-medium text-[#777777] uppercase tracking-wider font-mono">
                Tokens Tracked
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <Counter
                  value={2841920}
                  className="text-xl font-bold font-mono text-white tabular-nums"
                />
                <span className="text-[10px] text-[#10b981] font-mono">100% Local</span>
              </div>
            </motion.div>
          </StaggerItem>

          <StaggerItem>
            <motion.div
              whileHover={shouldReduceMotion ? {} : { y: -3 }}
              transition={{ duration: 0.2, ease: appleEase }}
              className="rounded-lg border border-[#1f1f1f] bg-[#0c0c0c] p-4 flex flex-col justify-between hover:border-[#2d2d2d] transition-colors shadow-sm hover:shadow-md hover:shadow-black/40"
            >
              <span className="text-[11px] font-medium text-[#777777] uppercase tracking-wider font-mono">
                Spend Monitored
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <Counter
                  value={34.18}
                  prefix="$"
                  decimals={2}
                  className="text-xl font-bold font-mono text-white tabular-nums"
                />
                <span className="text-[10px] text-[#888888] font-mono">Under Budget</span>
              </div>
            </motion.div>
          </StaggerItem>

          <StaggerItem>
            <motion.div
              whileHover={shouldReduceMotion ? {} : { y: -3 }}
              transition={{ duration: 0.2, ease: appleEase }}
              className="rounded-lg border border-[#1f1f1f] bg-[#0c0c0c] p-4 flex flex-col justify-between hover:border-[#2d2d2d] transition-colors shadow-sm hover:shadow-md hover:shadow-black/40"
            >
              <span className="text-[11px] font-medium text-[#777777] uppercase tracking-wider font-mono">
                Ingested Sources
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <Counter
                  value={6}
                  suffix=" Supported"
                  className="text-xl font-bold font-mono text-white tabular-nums"
                />
                <span className="text-[10px] text-[#06b6d4] font-mono">Auto-Watch</span>
              </div>
            </motion.div>
          </StaggerItem>

          <StaggerItem>
            <motion.div
              whileHover={shouldReduceMotion ? {} : { y: -3 }}
              transition={{ duration: 0.2, ease: appleEase }}
              className="rounded-lg border border-[#1f1f1f] bg-[#0c0c0c] p-4 flex flex-col justify-between hover:border-[#2d2d2d] transition-colors shadow-sm hover:shadow-md hover:shadow-black/40"
            >
              <span className="text-[11px] font-medium text-[#777777] uppercase tracking-wider font-mono">
                Network Telemetry
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <Counter
                  value={0}
                  suffix=" Bytes"
                  className="text-xl font-bold font-mono text-white tabular-nums"
                />
                <span className="text-[10px] text-[#10b981] font-mono">Offline Only</span>
              </div>
            </motion.div>
          </StaggerItem>
        </Stagger>
      </section>

      {/* CORE FEATURES GRID */}
      <section className="w-full max-w-5xl px-4 sm:px-6 py-12 border-t border-[#1f1f1f]">
        <FadeIn yOffset={16}>
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-white">
              Architected for Exact Local Visibility
            </h2>
            <p className="text-xs sm:text-sm text-[#888888] leading-relaxed">
              Provider dashboards only show organization-wide monthly totals. Token Tracker attributes every prompt, completion, and cache read to the local project and task that generated it.
            </p>
          </div>
        </FadeIn>

        {/* Staggered Feature Cards with Subtle Lift on Hover */}
        <Stagger staggerDelay={0.08} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feat) => {
            const Icon = feat.icon
            return (
              <StaggerItem key={feat.title}>
                <motion.div
                  whileHover={shouldReduceMotion ? {} : { y: -3 }}
                  transition={{ duration: 0.2, ease: appleEase }}
                >
                  <Card className="border-[#1f1f1f] bg-[#0a0a0a] hover:border-[#2d2d2d] transition-colors duration-200 shadow-sm hover:shadow-md hover:shadow-black/40 h-full">
                    <CardHeader className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded bg-[#141414] border border-[#222222] flex items-center justify-center text-white">
                          <Icon className="w-4 h-4 text-[#10b981]" />
                        </div>
                        <Badge variant="muted" className="text-[10px] font-mono">
                          {feat.badge}
                        </Badge>
                      </div>
                      <CardTitle className="text-base text-white font-sans font-semibold pt-1">
                        {feat.title}
                      </CardTitle>
                      <CardDescription className="text-xs text-[#8c8c8c] leading-relaxed">
                        {feat.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              </StaggerItem>
            )
          })}
        </Stagger>
      </section>

      {/* SUPPORTED LOCAL SOURCES */}
      <section className="w-full max-w-5xl px-4 sm:px-6 py-12 border-t border-[#1f1f1f]">
        <FadeIn yOffset={16}>
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-[11px] font-medium text-[#777777] uppercase tracking-wider font-mono">
                Compatibility Matrix
              </span>
              <h2 className="text-xl sm:text-2xl font-sans font-bold text-white tracking-tight mt-1">
                Supported Agentic Coding Tools
              </h2>
            </div>
            <span className="text-xs text-[#888888] max-w-xs sm:text-right">
              Automatically discovered on your machine with zero configuration required.
            </span>
          </div>
        </FadeIn>

        {/* Staggered Tool Matrix */}
        <Stagger staggerDelay={0.05} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {supportedTools.map((tool) => (
            <StaggerItem key={tool.name}>
              <motion.div
                whileHover={shouldReduceMotion ? {} : { y: -2 }}
                transition={{ duration: 0.2, ease: appleEase }}
                className="p-4 rounded-lg border border-[#1f1f1f] bg-[#0c0c0c] flex flex-col justify-between space-y-3 hover:border-[#2d2d2d] transition-colors duration-200 shadow-sm h-full"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white font-sans">{tool.name}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                      tool.status === "Exact Tokens"
                        ? "border-[#10b981]/30 bg-[#10b981]/10 text-[#10b981]"
                        : "border-[#06b6d4]/30 bg-[#06b6d4]/10 text-[#06b6d4]"
                    }`}
                  >
                    {tool.status}
                  </span>
                </div>
                <div className="text-[11px] text-[#666666] font-mono">
                  Log Format: {tool.type}
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="w-full max-w-5xl px-4 sm:px-6 py-16 border-t border-[#1f1f1f]">
        <FadeIn yOffset={20}>
          <div className="rounded-xl border border-[#222222] bg-gradient-to-b from-[#0e0e0e] to-[#080808] p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-black/50">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-sans font-bold text-white tracking-tight">
                Ready to take control of your agentic AI spending?
              </h3>
              <p className="text-xs sm:text-sm text-[#888888] max-w-md">
                Download the single portable installer for Windows. No account registration, no credit card, no cloud dependencies.
              </p>
            </div>
            <motion.div
              whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              transition={{ type: "spring", stiffness: 450, damping: 25 }}
              className="flex-shrink-0"
            >
              <Button asChild size="lg" className="bg-white text-black font-semibold hover:bg-white/90 h-11 px-6 shadow-lg shadow-white/5">
                <Link href="/download" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>Get Token Tracker v1.7</span>
                </Link>
              </Button>
            </motion.div>
          </div>
        </FadeIn>
      </section>
    </div>
  )
}
