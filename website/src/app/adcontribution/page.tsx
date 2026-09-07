import React from "react"
import Link from "next/link"
import { Heart, Sparkles, ArrowLeft, CheckCircle2, Shield } from "lucide-react"

export const metadata = {
  title: "Contribution & Support — Token Tracker",
  description: "Thanks for supporting Token Tracker.",
  robots: "noindex, nofollow",
}

export default function AdContributionPage() {
  return (
    <div className="relative min-h-[85vh] flex items-center justify-center py-20 px-4 sm:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full text-center">
        {/* Heart Icon Badge */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-6 shadow-lg shadow-emerald-500/5">
          <Heart className="w-8 h-8 fill-emerald-500/20 text-emerald-400" />
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
          Thanks for supporting Token Tracker!
        </h1>

        {/* Required copy */}
        <p className="text-base text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed">
          Thanks for supporting Token Tracker — more coming here soon.
        </p>

        {/* Feature Unlocked Notice */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm p-5 text-left mb-8 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>Pro Features Permanently Unlocked</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Your Token Tracker desktop app has now unlocked all Pro and Quality-of-Life features:
            unlimited exports, compact views, custom date ranges, per-project chart styling, and session notes.
          </p>
          <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-500">
            <Shield className="w-3.5 h-3.5 text-zinc-400" />
            <span>Zero cloud dependency · Local SQLite verification</span>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white px-4 py-2 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
