import React, { useState } from 'react'
import { Sparkles, Heart, ExternalLink, X, ShieldCheck, Key, Check, AlertCircle, Loader2 } from 'lucide-react'
import { useUnlock } from '../context/UnlockContext'

export const UnlockModal: React.FC = () => {
  const { isModalOpen, closeUnlockModal, supportAndUnlock, activateCode } = useUnlock()
  const [pastedCode, setPastedCode] = useState<string>('')
  const [isActivating, setIsActivating] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [showCodeInput, setShowCodeInput] = useState<boolean>(false)

  if (!isModalOpen) return null

  const handleSupportClick = async () => {
    try {
      await supportAndUnlock()
      // Automatically open code input section so user can paste the code when they copy it from the browser
      setShowCodeInput(true)
    } catch (err) {
      console.error('Failed to open supporter page:', err)
    }
  }

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pastedCode.trim()) {
      setErrorMsg('Please enter an activation code')
      return
    }

    setIsActivating(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const result = await activateCode(pastedCode.trim())
      if (result.success) {
        setSuccessMsg('Token Tracker Pro activated!')
        setTimeout(() => {
          closeUnlockModal()
        }, 1200)
      } else {
        setErrorMsg(result.error || 'Invalid code')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid code')
    } finally {
      setIsActivating(false)
    }
  }

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
        <div className="rounded-lg bg-muted/40 border border-border/60 p-3 mb-4 space-y-1.5 text-[11px] text-muted-foreground">
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

        {/* Code Activation Section */}
        {showCodeInput ? (
          <form onSubmit={handleActivate} className="mb-5 p-3 rounded-lg border border-border bg-muted/30 space-y-2.5 animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between text-[11px] font-medium text-foreground">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Enter Activation Code</span>
              </span>
              <button
                type="button"
                onClick={() => supportAndUnlock()}
                className="text-[10px] text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                <span>Re-open page</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste code from browser..."
                value={pastedCode}
                onChange={(e) => {
                  setPastedCode(e.target.value)
                  if (errorMsg) setErrorMsg(null)
                }}
                className="flex-1 bg-background border border-border rounded-md px-2.5 py-1.5 text-xs font-mono text-foreground placeholder:text-muted-foreground outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={isActivating || !pastedCode.trim()}
                className="px-3 py-1.5 text-xs font-semibold rounded-md bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white transition-colors cursor-pointer shrink-0"
              >
                {isActivating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Activate'}
              </button>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-1.5 text-[11px] text-destructive font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
          </form>
        ) : (
          <div className="mb-5 flex items-center justify-between text-[11px] text-muted-foreground px-1">
            <span>Already have an activation code?</span>
            <button
              type="button"
              onClick={() => setShowCodeInput(true)}
              className="text-emerald-400 hover:underline font-medium cursor-pointer"
            >
              Enter code
            </button>
          </div>
        )}

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
            onClick={handleSupportClick}
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
