import React from "react"
import Link from "next/link"
import { Heart, ArrowLeft, CheckCircle2, Shield, Sparkles } from "lucide-react"
import { AdUnit } from "@/components/AdUnit"

export const metadata = {
  title: "Contribution & Support — Token Tracker",
  description: "Thanks for supporting Token Tracker.",
  robots: "noindex, nofollow",
}

export default function AdContributionPage() {
  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-start py-16 px-4 sm:px-6">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-zinc-950/50 to-zinc-950 pointer-events-none" />

      <div className="relative z-10 max-w-3xl w-full flex flex-col items-center text-center">
        {/* ================================================================= */}
        {/* TOP SECTION: Visible Thank-You & Unlocked Status                   */}
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

        {/* Feature Unlocked Confirmation Card */}
        <div className="w-full max-w-xl rounded-xl border border-emerald-500/30 bg-emerald-950/20 backdrop-blur-sm p-5 text-left mb-10 shadow-lg shadow-emerald-950/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Pro Features Permanently Unlocked</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-medium">
              v1.8 PRO ACTIVE
            </span>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">
            Your Token Tracker desktop app has now unlocked all Pro and Quality-of-Life features:
            unlimited report exports, compact table views, custom date ranges, project favorites,
            per-project chart colors, audio budget alerts, and session tags.
          </p>

          <div className="flex items-center gap-2 pt-2 border-t border-emerald-500/20 text-[11px] text-zinc-400">
            <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Trust-based unlock · Zero cloud telemetry · Local SQLite confirmation</span>
          </div>
        </div>

        {/* ================================================================= */}
        {/* AD UNIT 1 (300x250 Medium Rectangle)                             */}
        {/* Placed near the top, directly below the thank-you message         */}
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
