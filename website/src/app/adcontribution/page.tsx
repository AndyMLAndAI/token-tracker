"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  Heart,
  ArrowLeft,
  CheckCircle2,
  Shield,
  Copy,
  Check,
  Key,
  Clock,
} from "lucide-react"
import { AdUnit } from "@/components/AdUnit"
import { generateActivationCode } from "@/lib/activation"

export default function AdContributionPage() {
  const [secondsLeft, setSecondsLeft] = useState<number>(30)
  const [code, setCode] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [copied, setCopied] = useState<boolean>(false)

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (!code && !isGenerating) {
        setIsGenerating(true)
        generateActivationCode()
          .then((generatedCode) => {
            setCode(generatedCode)
          })
          .catch((err) => {
            console.error("Failed to generate activation code:", err)
          })
          .finally(() => {
            setIsGenerating(false)
          })
      }
      return
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [secondsLeft, code, isGenerating])

  const handleCopyCode = async () => {
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch (err) {
      console.error("Failed to copy code to clipboard:", err)
    }
  }

  const progressPercent = Math.min(100, Math.round(((30 - secondsLeft) / 30) * 100))

  return (
    <div className="relative flex-1 flex flex-col justify-between py-2 sm:py-3 px-3 sm:px-4 max-w-5xl w-full mx-auto">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-zinc-950/40 to-transparent pointer-events-none" />

      <div className="relative z-10 w-full flex flex-col items-center justify-between flex-1 gap-2 sm:gap-3">
        {/* ================================================================= */}
        {/* TOP SECTION: Compact Header with Thank-You Copy                   */}
        {/* ================================================================= */}
        <div className="w-full flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Heart className="w-3.5 h-3.5 fill-emerald-500/20" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Thanks for supporting Token Tracker!
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-medium hidden sm:inline-block">
              v1.8 PRO ACTIVATION
            </span>
          </div>

          <p className="text-xs text-zinc-300 leading-normal max-w-xl">
            Thanks for supporting Token Tracker — more coming here soon.
          </p>
        </div>

        {/* ================================================================= */}
        {/* AD UNIT 2 (728x90 Leaderboard Banner)                            */}
        {/* Full-width strip positioned compactly across the top row          */}
        {/* ================================================================= */}
        <div className="w-full flex justify-center">
          <AdUnit
            adKey="3d681e4577cdb05080d7bd3892ceb4ac"
            width={728}
            height={90}
            label="Featured Sponsor"
            compact={true}
            className="w-full max-w-[760px]"
          />
        </div>

        {/* ================================================================= */}
        {/* MIDDLE TWO-COLUMN GRID: 300x250 and [Code Box + 468x60 Ad]       */}
        {/* Side by side layout fitting cleanly in the desktop viewport       */}
        {/* ================================================================= */}
        <div className="w-full max-w-[840px] grid grid-cols-1 md:grid-cols-12 gap-3 items-center justify-center">
          {/* LEFT: Ad Unit 1 (300x250 Medium Rectangle) */}
          <div className="md:col-span-5 flex justify-center">
            <AdUnit
              adKey="eb02dfabc6d6bcdee8cb5adfa6f13d03"
              width={300}
              height={250}
              label="Community Supporter"
              compact={true}
              className="w-full max-w-[325px]"
            />
          </div>

          {/* RIGHT: Activation Code / Countdown Card + Ad Unit 3 (468x60) */}
          <div className="md:col-span-7 flex flex-col justify-between h-full gap-2.5 max-w-[485px] mx-auto w-full">
            {/* Activation Card */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-md p-3.5 shadow-xl shadow-black/30 flex flex-col justify-between flex-1 min-h-[175px]">
              {!code ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "3s" }} />
                      <span>Generating Activation Code</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                      {secondsLeft}s left
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-1000 ease-linear rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Thank you for supporting Token Tracker! Your self-verifying activation code will appear here in{" "}
                    <span className="text-white font-medium">{secondsLeft} seconds</span>.
                  </p>

                  <div className="flex items-center gap-2 pt-1.5 border-t border-zinc-800/80 text-[10px] text-zinc-500">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Unlocks 15+ Pro features, unlimited exports, & custom themes</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 animate-in fade-in-50 zoom-in-95 duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                      <Key className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Activation Code Ready</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      30-Min Expiration
                    </span>
                  </div>

                  {/* Code Box */}
                  <div className="flex items-center gap-2 bg-zinc-950/80 border border-zinc-700/80 rounded-lg p-1.5">
                    <input
                      type="text"
                      readOnly
                      value={code}
                      className="w-full bg-transparent text-xs font-mono text-emerald-300 px-2 py-0.5 outline-none select-all truncate"
                    />
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shrink-0 transition-colors shadow-sm cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Required copy */}
                  <p className="text-[11px] text-zinc-300 font-medium leading-tight">
                    Paste this code in Token Tracker within 30 minutes to unlock.
                  </p>

                  <div className="flex items-center gap-1.5 pt-1.5 border-t border-zinc-800 text-[10px] text-zinc-500">
                    <Shield className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Cryptographic HMAC-SHA256 · Local SQLite Activation</span>
                  </div>
                </div>
              )}
            </div>

            {/* AD UNIT 3 (468x60 Small Banner) */}
            <AdUnit
              adKey="9f445896781f99abb8a199b0f4805122"
              width={468}
              height={60}
              label="Partner Showcase"
              compact={true}
              className="w-full"
            />
          </div>
        </div>

        {/* ================================================================= */}
        {/* FOOTER ACTIONS: Minimal Return Link & Disclaimer                  */}
        {/* ================================================================= */}
        <div className="flex items-center justify-between w-full max-w-3xl pt-1.5 border-t border-zinc-800/80 text-[11px] text-zinc-500">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-medium text-zinc-400 hover:text-white px-3 py-1 rounded-md border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Return to Homepage</span>
          </Link>
          <span className="hidden sm:inline">
            Token Tracker is 100% local-first · Supporting keeps development active
          </span>
        </div>
      </div>
    </div>
  )
}
