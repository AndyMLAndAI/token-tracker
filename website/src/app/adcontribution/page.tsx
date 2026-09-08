"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  Heart,
  ArrowLeft,
  CheckCircle2,
  Shield,
  Sparkles,
  Copy,
  Check,
  Key,
  Clock,
  Loader2,
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
    <div className="relative min-h-[90vh] flex flex-col items-center justify-start py-16 px-4 sm:px-6">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-zinc-950/50 to-zinc-950 pointer-events-none" />

      <div className="relative z-10 max-w-3xl w-full flex flex-col items-center text-center">
        {/* ================================================================= */}
        {/* TOP SECTION: Visible Thank-You & Header                           */}
        {/* ================================================================= */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-6 shadow-xl shadow-emerald-500/10">
          <Heart className="w-8 h-8 fill-emerald-500/20 text-emerald-400" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
          Thanks for supporting Token Tracker!
        </h1>

        {/* Required thank-you copy */}
        <p className="text-base sm:text-lg text-zinc-300 mb-6 max-w-lg leading-relaxed font-normal">
          Thanks for supporting Token Tracker — more coming here soon.
        </p>

        {/* ================================================================= */}
        {/* 30-SECOND COUNTDOWN & ACTIVATION CODE BOX                         */}
        {/* ================================================================= */}
        <div className="w-full max-w-xl rounded-xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-md p-6 text-left mb-10 shadow-2xl shadow-black/40">
          {!code ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  <Clock className="w-4 h-4 animate-spin text-amber-400" style={{ animationDuration: "3s" }} />
                  <span>Generating Activation Code</span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                  {secondsLeft}s remaining
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Thank you for visiting our supporter page! Your self-verifying activation code will appear here in{" "}
                <span className="text-white font-medium">{secondsLeft} seconds</span>. Please take a moment to look at
                our sponsors below.
              </p>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in-50 zoom-in-95 duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  <Key className="w-4 h-4 text-emerald-400" />
                  <span>Activation Code Ready</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  30-Min Expiration
                </span>
              </div>

              {/* Code Box */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-zinc-950/80 border border-zinc-700/80 rounded-lg p-2">
                <input
                  type="text"
                  readOnly
                  value={code}
                  className="w-full bg-transparent text-xs font-mono text-emerald-300 px-2 py-1 outline-none select-all truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shrink-0 transition-colors shadow-sm cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Instructions text required by prompt */}
              <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                Paste this code in Token Tracker within 30 minutes to unlock.
              </p>

              <div className="flex items-center gap-2 pt-2 border-t border-zinc-800 text-[11px] text-zinc-500">
                <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>HMAC-SHA256 Cryptographic Verification · No Account Needed</span>
              </div>
            </div>
          )}
        </div>

        {/* Feature Overview Card */}
        <div className="w-full max-w-xl rounded-xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm p-5 text-left mb-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>What Unlocks With This Code</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
              15 Pro Features
            </span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Unlimited report exports, compact table views, custom date range filtering, project nicknames,
            per-project chart colors, audio budget chimes, and session tags — permanently saved to your local database.
          </p>
        </div>

        {/* ================================================================= */}
        {/* AD UNIT 1 (300x250 Medium Rectangle)                             */}
        {/* Placed near the top, directly below the activation card           */}
        {/* ================================================================= */}
        <div className="w-full max-w-md flex flex-col items-center mb-12">
          <AdUnit
            adKey="eb02dfabc6d6bcdee8cb5adfa6f13d03"
            width={300}
            height={250}
            label="Community Supporter"
            className="w-full max-w-[340px]"
          />
          <span className="text-[11px] text-zinc-500 mt-2">
            Ad impressions support continuous open-source maintenance
          </span>
        </div>

        {/* Section Divider */}
        <div className="w-full max-w-2xl flex items-center gap-4 my-2 mb-10">
          <div className="flex-1 h-px bg-zinc-800" />
          <div className="flex items-center gap-1.5 text-zinc-600 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500/60" />
            <span className="uppercase tracking-widest text-[10px]">Supporter Showcase</span>
          </div>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        {/* ================================================================= */}
        {/* AD UNIT 2 (728x90 Leaderboard Banner)                            */}
        {/* Placed as a horizontal strip further down the page                */}
        {/* ================================================================= */}
        <div className="w-full max-w-3xl flex flex-col items-center mb-12">
          <AdUnit
            adKey="3d681e4577cdb05080d7bd3892ceb4ac"
            width={728}
            height={90}
            label="Featured Sponsor"
            className="w-full"
          />
        </div>

        {/* Section Divider */}
        <div className="w-full max-w-lg flex items-center gap-4 my-2 mb-10">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-zinc-600 text-[10px] uppercase tracking-widest">Sponsored</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        {/* ================================================================= */}
        {/* AD UNIT 3 (468x60 Small Banner)                                  */}
        {/* Placed near the bottom of the page                                */}
        {/* ================================================================= */}
        <div className="w-full max-w-xl flex flex-col items-center mb-12">
          <AdUnit
            adKey="9f445896781f99abb8a199b0f4805122"
            width={468}
            height={60}
            label="Partner Showcase"
            className="w-full max-w-[500px]"
          />
        </div>

        {/* ================================================================= */}
        {/* FOOTER ACTIONS                                                    */}
        {/* ================================================================= */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-zinc-800/80 w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-300 hover:text-white px-5 py-2.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Homepage</span>
          </Link>
        </div>

        <p className="text-[11px] text-zinc-600 mt-6 max-w-md">
          Token Tracker is 100% local-first and privacy-respecting.
          Thank you for supporting independent developer tools!
        </p>
      </div>
    </div>
  )
}
