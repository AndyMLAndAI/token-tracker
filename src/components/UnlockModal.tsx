import React from 'react'
import { Sparkles, Heart, ExternalLink, X, ShieldCheck } from 'lucide-react'
import { useUnlock } from '../context/UnlockContext'

export const UnlockModal: React.FC = () => {
  const { isModalOpen, closeUnlockModal, supportAndUnlock } = useUnlock()

  if (!isModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in-0 duration-150"
        onClick={closeUnlockModal}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-xl border border-border/80 bg-card p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={closeUnlockModal}
          className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Heart className="w-5 h-5 fill-emerald-500/20" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground tracking-tight">
              Seems like you LOVE Token Tracker!
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span className="text-[11px] text-amber-400/90 font-medium">
                Unlock 15+ Pro Features & Unlimited Exports
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          Wanna help by contributing and unlocking this option forever?
        </p>

        {/* Perks list preview */}
        <div className="rounded-lg bg-muted/40 border border-border/60 p-3 mb-5 space-y-1.5 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Unlimited CSV, JSON, and Markdown report exports</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Full custom accent color picker & per-project chart colors</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Compact views, custom date ranges, project nicknames & pins</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Permanent, instant unlock — saved directly to your local database</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={closeUnlockModal}
            className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
          >
            Maybe later
          </button>
          <button
            type="button"
            onClick={supportAndUnlock}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-md bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <span>Support Token Tracker</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
