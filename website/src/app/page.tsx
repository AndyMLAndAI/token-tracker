"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Activity, ArrowRight, Check, FolderGit2, Radio, ScanLine, ShieldCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/FadeIn"
import { appleEase } from "@/components/motion/animations"

const sources = [
  { id: "claude", name: "Claude Code", detail: "JSONL session stream", mode: "Exact", volume: "1.84M", bars: [36, 58, 44, 78, 55, 88, 67] },
  { id: "cursor", name: "Cursor", detail: "Local workspace database", mode: "Estimated", volume: "482K", bars: [24, 42, 31, 62, 48, 39, 72] },
  { id: "cline", name: "Cline + Roo", detail: "Task usage history", mode: "Exact", volume: "298K", bars: [42, 24, 55, 48, 76, 42, 68] },
]

const features = [
  { icon: FolderGit2, kicker: "Attribution", title: "Every token has a home.", body: "See the project, conversation, model, and cost behind every unit of usage." },
  { icon: ShieldCheck, kicker: "Privacy", title: "Your telemetry never leaves.", body: "All parsing, estimation, and storage happens locally on your workstation." },
  { icon: ScanLine, kicker: "Clarity", title: "Exact when possible.", body: "Clear provenance badges show which measurements come straight from provider data." },
]

export default function HomePage() {
  const shouldReduceMotion = useReducedMotion()
  const [activeSource, setActiveSource] = useState("claude")
  const source = useMemo(() => sources.find((item) => item.id === activeSource) ?? sources[0], [activeSource])

  return (
    <div className="w-full overflow-hidden bg-white text-black">
      <section className="relative mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-6xl flex-col items-center justify-center px-5 pb-16 pt-20 text-center sm:px-8">
        <motion.div aria-hidden="true" animate={shouldReduceMotion ? {} : { scale: [1, 1.08, 1], opacity: [0.45, 0.8, 0.45] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="pointer-events-none absolute left-1/2 top-[44%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/[0.08]" />
        <motion.div aria-hidden="true" animate={shouldReduceMotion ? {} : { rotate: 360 }} transition={{ duration: 28, repeat: Infinity, ease: "linear" }} className="pointer-events-none absolute left-1/2 top-[44%] h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-black/[0.08]" />
        <FadeIn delay={0.05} yOffset={10} className="relative"><Badge variant="outline" className="rounded-full border-black/15 bg-white px-3 py-1 text-[11px] font-medium text-[#666] shadow-none"><span className="mr-2 inline-flex h-1.5 w-1.5 rounded-full bg-black" />v1.8 · Local-first telemetry</Badge></FadeIn>
        <FadeIn delay={0.12} yOffset={18} className="relative mt-7"><h1 className="max-w-4xl text-balance text-5xl font-medium leading-[0.96] tracking-[-0.055em] sm:text-7xl md:text-8xl">Know where every token goes.</h1></FadeIn>
        <FadeIn delay={0.2} yOffset={18} className="relative mt-7 max-w-2xl"><p className="text-pretty text-lg leading-8 tracking-[-0.01em] text-[#666] sm:text-xl">A quiet, local command center for the AI work already happening on your machine.</p></FadeIn>
        <FadeIn delay={0.28} yOffset={16} className="relative mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <motion.div whileHover={shouldReduceMotion ? {} : { y: -2 }} whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}><Button asChild size="lg" className="h-11 rounded-full bg-black px-6 text-sm font-medium text-white shadow-none hover:bg-[#222]"><Link href="/download">Download for Windows <ArrowRight className="ml-2 h-4 w-4" /></Link></Button></motion.div>
          <Button asChild variant="outline" size="lg" className="h-11 rounded-full border-black/15 bg-white px-6 text-sm font-medium shadow-none hover:bg-[#f1f1f1]"><Link href="#live-view">See it in motion <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
        </FadeIn>
        <FadeIn delay={0.36} yOffset={12} className="relative mt-7 text-[13px] text-[#8f8f8f]">Windows 10 / 11 · No account · No cloud telemetry</FadeIn>
      </section>

      <section id="live-view" className="mx-auto max-w-6xl px-5 pb-28 sm:px-8">
        <FadeIn yOffset={24}><div className="overflow-hidden rounded-md border border-black/15 bg-white">
          <div className="flex h-11 items-center justify-between border-b border-black/10 px-4"><div className="flex items-center gap-2 text-[12px] text-[#666]"><span className="h-2 w-2 rounded-full bg-black" />Live local workspace</div><div className="flex items-center gap-2 text-[11px] text-[#666]"><Radio className="h-3.5 w-3.5" />Watching 6 sources</div></div>
          <div className="grid min-h-[510px] md:grid-cols-[210px_1fr]">
            <aside className="border-b border-black/10 p-3 md:border-b-0 md:border-r"><p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[#8f8f8f]">Sources</p><div className="flex gap-2 overflow-x-auto md:block md:space-y-1">{sources.map((item) => { const isActive = item.id === activeSource; return <button key={item.id} onClick={() => setActiveSource(item.id)} className={`group min-w-[170px] rounded-md px-3 py-2.5 text-left transition-colors md:block md:w-full ${isActive ? "bg-black text-white" : "hover:bg-[#f1f1f1]"}`}><span className="flex items-center justify-between text-[13px] font-medium"><span>{item.name}</span><span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-white" : "bg-black/40 group-hover:bg-black"}`} /></span><span className={`mt-1 block text-[11px] ${isActive ? "text-white/65" : "text-[#8f8f8f]"}`}>{item.mode} usage</span></button> })}</div></aside>
            <div className="relative p-5 sm:p-8">
              <div className="flex flex-col justify-between gap-6 border-b border-black/10 pb-6 sm:flex-row sm:items-start"><AnimatePresence mode="wait"><motion.div key={source.id} initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: appleEase }}><p className="text-[13px] text-[#666]">{source.detail}</p><h2 className="mt-1 text-3xl font-medium tracking-[-0.04em]">{source.name}</h2></motion.div></AnimatePresence><Badge variant="outline" className="w-fit rounded-full border-black/15 bg-white px-3 py-1 text-[11px] font-medium text-black">{source.mode} measurement</Badge></div>
              <div className="grid gap-8 pt-8 lg:grid-cols-[1fr_190px]"><div><div className="flex items-end justify-between"><div><p className="text-[12px] text-[#666]">Tokens processed · last 7 days</p><p className="mt-1 text-4xl font-medium tracking-[-0.05em]">{source.volume}</p></div><Activity className="h-5 w-5 text-[#666]" /></div><div className="mt-10 flex h-40 items-end gap-2 border-b border-black/15 pb-1">{source.bars.map((height, index) => <motion.div key={`${source.id}-${index}`} initial={false} animate={{ height: `${height}%` }} transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: index * 0.035, ease: appleEase }} className="min-w-0 flex-1 rounded-t-[3px] bg-black" />)}</div><div className="mt-3 flex justify-between text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div></div><div className="space-y-3">{[["Provenance", source.mode], ["Storage", "Local SQLite"], ["Sync", "Watching"]].map(([label, value]) => <div key={label} className="rounded-md border border-black/10 p-3"><p className="text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">{label}</p><p className="mt-1 text-[13px] font-medium">{value}</p></div>)}</div></div>
              <motion.div aria-hidden="true" animate={shouldReduceMotion ? {} : { top: ["16%", "83%", "16%"] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} className="pointer-events-none absolute left-5 right-5 h-px bg-black/10 md:left-8 md:right-8" />
            </div>
          </div>
        </div></FadeIn>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8"><FadeIn yOffset={16} className="flex flex-col justify-between gap-5 border-t border-black/15 pt-5 sm:flex-row sm:items-end"><div><p className="text-[13px] font-medium text-[#666]">The essential layer</p><h2 className="mt-2 max-w-xl text-4xl font-medium tracking-[-0.045em] sm:text-5xl">Less guessing. More signal.</h2></div><p className="max-w-sm text-[15px] leading-6 text-[#666]">A focused UI for your local agentic work—not another dashboard competing for your attention.</p></FadeIn><Stagger staggerDelay={0.09} className="mt-12 grid gap-4 md:grid-cols-3">{features.map((feature) => { const Icon = feature.icon; return <StaggerItem key={feature.title}><motion.div whileHover={shouldReduceMotion ? {} : { y: -5 }} transition={{ duration: 0.25, ease: appleEase }} className="h-full"><Card className="h-full rounded-md border-black/15 bg-white shadow-none transition-colors hover:bg-[#f1f1f1]"><CardHeader className="p-5"><Icon className="mb-10 h-5 w-5" /><p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#666]">{feature.kicker}</p><CardTitle className="mt-2 text-xl font-medium tracking-[-0.03em] text-black">{feature.title}</CardTitle><CardDescription className="pt-2 text-[14px] leading-6 text-[#666]">{feature.body}</CardDescription></CardHeader></Card></motion.div></StaggerItem> })}</Stagger></section>

      <section className="mx-auto max-w-6xl px-5 pb-28 pt-12 sm:px-8"><FadeIn yOffset={20}><div className="flex flex-col gap-8 rounded-md border border-black/15 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-10"><div><div className="mb-5 flex h-9 w-9 items-center justify-center rounded-full border border-black/15"><Sparkles className="h-4 w-4" /></div><h2 className="max-w-xl text-3xl font-medium tracking-[-0.04em] sm:text-4xl">Your AI spend deserves a local ledger.</h2><p className="mt-3 max-w-lg text-[15px] leading-6 text-[#666]">Install Token Tracker and start with the work you have already done.</p></div><div className="flex shrink-0 flex-col gap-3 sm:items-end"><Button asChild size="lg" className="h-11 rounded-full bg-black px-6 text-sm text-white hover:bg-[#222]"><Link href="/download">Get Token Tracker <ArrowRight className="ml-2 h-4 w-4" /></Link></Button><span className="flex items-center gap-1.5 text-[12px] text-[#666]"><Check className="h-3.5 w-3.5" />Works entirely offline</span></div></div></FadeIn></section>
    </div>
  )
}
