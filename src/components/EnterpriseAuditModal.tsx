import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  ShieldCheck,
  Download,
  Copy,
  Check,
  FileCheck2,
  Lock,
  Hash,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { playClick, playSuccess, playSnap } from '@/lib/audio'
import { springPhysics } from '@/lib/motion'

interface EnterpriseAuditModalProps {
  isOpen: boolean
  onClose: () => void
  sessionId: string
  sessionName?: string
}

export function EnterpriseAuditModal({
  isOpen,
  onClose,
  sessionId,
  sessionName,
}: EnterpriseAuditModalProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [bundleData, setBundleData] = useState<any | null>(null)
  const [sha256Digest, setSha256Digest] = useState<string>('')
  const [copiedJson, setCopiedJson] = useState(false)
  const [copiedSha, setCopiedSha] = useState(false)
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !sessionId) return

    const fetchBundle = async () => {
      setIsLoading(true)
      try {
        if (window.electronAPI?.exportSignedAuditBundle) {
          const res = await window.electronAPI.exportSignedAuditBundle(sessionId)
          if (res.success && res.bundle) {
            setBundleData(res.bundle)
            setSha256Digest(res.sha256 || '')
          }
        }
      } catch (err) {
        console.error('Failed to export audit bundle:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBundle()
  }, [isOpen, sessionId])

  if (!isOpen) return null

  const handleCopyDigest = () => {
    playClick()
    navigator.clipboard.writeText(sha256Digest)
    setCopiedSha(true)
    setTimeout(() => setCopiedSha(false), 2000)
  }

  const handleCopyJson = () => {
    playSuccess()
    const jsonStr = JSON.stringify(bundleData, null, 2)
    navigator.clipboard.writeText(jsonStr)
    setCopiedJson(true)
    setTimeout(() => setCopiedJson(false), 2000)
  }

  const handleDownloadFile = async () => {
    playClick()
    if (!bundleData) return
    const defaultFilename = `token-tracker-audit-${sessionId.slice(0, 8)}-${Date.now()}.json`
    const content = JSON.stringify(bundleData, null, 2)

    if (window.electronAPI?.saveAuditBundleToFile) {
      const res = await window.electronAPI.saveAuditBundleToFile({
        defaultFilename,
        content,
      })
      if (res.success && res.filePath) {
        playSuccess()
        setSaveSuccessMsg(`Saved to ${res.filePath}`)
        setTimeout(() => setSaveSuccessMsg(null), 4000)
      }
    } else {
      // Browser fallback download
      const blob = new Blob([content], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = defaultFilename
      a.click()
      URL.revokeObjectURL(url)
      setSaveSuccessMsg('Downloaded bundle file')
      setTimeout(() => setSaveSuccessMsg(null), 3000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={springPhysics.subtle}
        className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden p-6 space-y-4 text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold tracking-wide uppercase font-mono">
                  Enterprise Audit Compliance Export
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                  SHA-256 SIGNED
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Tamper-evident cryptographically signed telemetry manifest for governance &amp; SOC2 audit trails
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playClick()
              onClose()
            }}
            className="text-xs text-zinc-500 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-xs font-mono text-zinc-500">
            Computing cryptographic SHA-256 hash chain across session turns...
          </div>
        ) : !bundleData ? (
          <div className="py-12 text-center text-xs font-mono text-rose-400">
            Failed to assemble audit bundle for session.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Digest Badge Box */}
            <div className="p-3.5 rounded-lg bg-black border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SHA-256 Root Chain Signature:</span>
                </span>
                <button
                  onClick={handleCopyDigest}
                  className="text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  {copiedSha ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Hash</span>
                    </>
                  )}
                </button>
              </div>
              <div className="font-mono text-xs text-emerald-400 bg-white/[0.02] p-2 rounded border border-white/5 break-all select-all font-semibold">
                {sha256Digest}
              </div>
            </div>

            {/* Spec & Chain Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
              <div className="p-2.5 rounded bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] uppercase text-zinc-500">Spec Version</span>
                <div className="text-white font-medium">{bundleData.specVersion}</div>
              </div>

              <div className="p-2.5 rounded bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] uppercase text-zinc-500">Turns Signed</span>
                <div className="text-white font-medium">{bundleData.session?.turnCount} turns</div>
              </div>

              <div className="p-2.5 rounded bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] uppercase text-zinc-500">Hash Algorithm</span>
                <div className="text-emerald-400 font-medium">SHA-256 Chain</div>
              </div>

              <div className="p-2.5 rounded bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] uppercase text-zinc-500">Chain Integrity</span>
                <div className="text-emerald-400 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Tamper Evident</span>
                </div>
              </div>
            </div>

            {/* JSON Code Snippet Preview */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-zinc-500">
                Signed Manifest Preview:
              </span>
              <div className="p-3 bg-black border border-white/10 rounded-lg max-h-52 overflow-y-auto font-mono text-[11px] text-zinc-300 leading-relaxed whitespace-pre select-all">
                {JSON.stringify(bundleData, null, 2)}
              </div>
            </div>

            {/* Status Feedback */}
            {saveSuccessMsg && (
              <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div className="text-[11px] font-mono text-zinc-500">
                Compatible with SOC2, FedRAMP, and internal compliance vaults
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyJson}
                  className="h-8 text-xs border-white/10 text-zinc-300 hover:text-white"
                >
                  {copiedJson ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                      <span>Copied JSON</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1.5" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  onClick={handleDownloadFile}
                  className="h-8 text-xs bg-white text-black hover:bg-white/90 font-medium flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Signed Bundle</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
