import React from 'react'
import { Lock } from 'lucide-react'
import { useUnlock } from '../../context/UnlockContext'

interface LockedBadgeProps {
  label?: string
  className?: string
  featureName?: string
}

export const LockedBadge: React.FC<LockedBadgeProps> = ({
  label = 'Unlock to use',
  className = '',
  featureName,
}) => {
  const { isUnlocked, openUnlockModal } = useUnlock()

  if (isUnlocked) return null

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        openUnlockModal(featureName)
      }}
      title={`${label} — Click to unlock`}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium tracking-wide bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 hover:border-amber-500/50 transition-colors cursor-pointer select-none ${className}`}
    >
      <Lock className="w-2.5 h-2.5" />
      <span>{label}</span>
    </button>
  )
}
