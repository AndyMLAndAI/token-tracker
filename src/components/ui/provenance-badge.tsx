import React from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ShieldCheck, Cpu, Radio } from 'lucide-react'

export type ProvenanceType = 'exact' | 'estimated' | 'live_captured'

interface ProvenanceBadgeProps {
  provenance: ProvenanceType | string
  className?: string
  showIcon?: boolean
}

export function ProvenanceBadge({ provenance, className, showIcon = true }: ProvenanceBadgeProps) {
  const norm = (provenance || 'exact').toLowerCase()

  if (norm === 'estimated') {
    return (
      <Badge
        variant="outline"
        className={cn(
          'border-[#d97706]/40 bg-[#b45309]/10 text-[#f59e0b] font-mono text-[10px] px-1.5 py-0 inline-flex items-center gap-1',
          className
        )}
        title="Tokenizer-based estimation (js-tiktoken BPE); exact API usage unavailable"
      >
        {showIcon && <Cpu className="w-2.5 h-2.5 text-[#f59e0b]" />}
        Estimated
      </Badge>
    )
  }

  if (norm === 'live_captured') {
    return (
      <Badge
        variant="outline"
        className={cn(
          'border-[#0284c7]/40 bg-[#0369a1]/10 text-[#38bdf8] font-mono text-[10px] px-1.5 py-0 inline-flex items-center gap-1',
          className
        )}
        title="Live-captured directly from real-time API response headers via local proxy"
      >
        {showIcon && <Radio className="w-2.5 h-2.5 text-[#38bdf8] animate-pulse" />}
        Live-captured
      </Badge>
    )
  }

  // Default: Exact
  return (
    <Badge
      variant="outline"
      className={cn(
        'border-[#059669]/40 bg-[#047857]/10 text-[#10b981] font-mono text-[10px] px-1.5 py-0 inline-flex items-center gap-1',
        className
      )}
      title="Exact token counts from local session logs or API usage payload"
    >
      {showIcon && <ShieldCheck className="w-2.5 h-2.5 text-[#10b981]" />}
      Exact
    </Badge>
  )
}
