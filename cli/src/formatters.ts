export function formatNumber(num: number | string): string {
  const n = Number(num || 0)
  if (n >= 1_000_000_000) {
    return (n / 1_000_000_000).toFixed(1) + 'B'
  }
  if (n >= 1_000_000) {
    return (n / 1_000_000).toFixed(1) + 'M'
  }
  if (n >= 1_000) {
    return (n / 1_000).toFixed(1) + 'k'
  }
  return n.toLocaleString()
}

export function formatCurrency(usd: number | string): string {
  const n = Number(usd || 0)
  if (n === 0) return '$0.00'
  if (n < 0.01) return '< $0.01'
  return `$${n.toFixed(2)}`
}

export function formatDate(timestamp: number | string): string {
  if (!timestamp) return 'n/a'
  const d = new Date(Number(timestamp))
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelativeTime(timestamp: number | string | null): string {
  if (!timestamp) return 'never'
  const diff = Date.now() - Number(timestamp)
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(timestamp)
}

export function getToolDisplayName(source: string): string {
  const s = String(source || '').toLowerCase()
  if (s.includes('claude')) return 'Claude Code'
  if (s.includes('antigravity') || s.includes('gemini')) return 'Antigravity'
  if (s.includes('cline')) return 'Cline'
  if (s.includes('roo')) return 'Roo Code'
  if (s.includes('aider')) return 'Aider'
  if (s.includes('cursor')) return 'Cursor'
  if (s.includes('windsurf')) return 'Windsurf'
  if (s.includes('proxy')) return 'Proxy Intercept'
  return source || 'Unknown'
}

export function getToolColor(source: string): string {
  const s = String(source || '').toLowerCase()
  if (s.includes('claude')) return 'cyan'
  if (s.includes('antigravity') || s.includes('gemini')) return 'magenta'
  if (s.includes('cline')) return 'blue'
  if (s.includes('roo')) return 'blue'
  if (s.includes('aider')) return 'green'
  if (s.includes('cursor')) return 'white'
  if (s.includes('windsurf')) return 'yellow'
  if (s.includes('proxy')) return 'red'
  return 'gray'
}
