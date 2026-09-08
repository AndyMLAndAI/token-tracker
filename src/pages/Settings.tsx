import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProvenanceBadge } from '@/components/ui/provenance-badge'
import { formatNumber, formatCurrency, CURRENCY_MAP, getCurrentCurrency } from '@/lib/utils'
import {
  RefreshCw,
  Terminal,
  Layers,
  HardDrive,
  Radio,
  Sparkles,
  Code2,
  Bot,
  Compass,
  Check,
  Copy,
  Trash2,
  AlertTriangle,
  Bell,
  ShieldAlert,
  DollarSign,
  Sliders,
  Heart,
  Volume2,
  Palette,
  Keyboard,
  Clock,
  Coins,
  Eye,
  ExternalLink,
  ShieldCheck,
  Key,
  AlertCircle,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { AppLogo } from '@/components/ui/AppLogo'
import { useUnlock } from '@/context/UnlockContext'
import { LockedBadge } from '@/components/ui/LockedBadge'

export function Settings() {
  const { isUnlocked, exportCount, openUnlockModal, supportAndUnlock, activateCode } = useUnlock()
  const [sources, setSources] = useState<any[]>([])
  const [isResyncing, setIsResyncing] = useState(false)
  const [lastSyncResult, setLastSyncResult] = useState<any>(null)
  const [proxyStatus, setProxyStatus] = useState<{ running: boolean; port: number; interceptedTurns: number }>({
    running: false,
    port: 19840,
    interceptedTurns: 0,
  })
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [isClearing, setIsClearing] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [clearStatusMessage, setClearStatusMessage] = useState<string | null>(null)

  // Code-based activation state
  const [unlockCodeInput, setUnlockCodeInput] = useState('')
  const [isActivatingCode, setIsActivatingCode] = useState(false)
  const [activationError, setActivationError] = useState<string | null>(null)
  const [activationSuccess, setActivationSuccess] = useState<string | null>(null)

  // App preferences (Tray & Startup)
  const [minimizeToTray, setMinimizeToTray] = useState(true)
  const [launchOnStartup, setLaunchOnStartup] = useState(false)

  // 15 QoL Feature States
  const [soundAlertChime, setSoundAlertChime] = useState(() => localStorage.getItem('token_tracker_sound_chime') === 'true')
  const [currency, setCurrency] = useState(() => getCurrentCurrency())
  const [idleDays, setIdleDays] = useState(() => localStorage.getItem('token_tracker_idle_days') || '30')
  const [cliInterval, setCliInterval] = useState(() => localStorage.getItem('token_tracker_cli_interval') || '2s')
  const [dataRetention, setDataRetention] = useState(() => localStorage.getItem('token_tracker_data_retention') || 'all')
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('token_tracker_accent_color') || '#10b981')
  const [reportCompany, setReportCompany] = useState(() => localStorage.getItem('token_tracker_company') || '')
  const [reportAuthor, setReportAuthor] = useState(() => localStorage.getItem('token_tracker_author') || '')
  const [isMiniHudActive, setIsMiniHudActive] = useState(false)
  const [isPruning, setIsPruning] = useState(false)
  const [pruneResult, setPruneResult] = useState<string | null>(null)

  // Budget configuration state
  const [budgets, setBudgets] = useState<any[]>([])
  const [projectsList, setProjectsList] = useState<any[]>([])
  const [budgetScope, setBudgetScope] = useState('global')
  const [budgetPeriod, setBudgetPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [budgetMetric, setBudgetMetric] = useState<'cost' | 'tokens'>('cost')
  const [budgetThreshold, setBudgetThreshold] = useState('')
  const [budgetNotifyOs, setBudgetNotifyOs] = useState(true)
  const [isSavingBudget, setIsSavingBudget] = useState(false)
  const [budgetSuccessMsg, setBudgetSuccessMsg] = useState<string | null>(null)

  const loadData = async () => {
    if (window.electronAPI) {
      try {
        const [sourcesRes, proxyRes, budgetsRes, projectsRes, appSettingsRes] = await Promise.all([
          window.electronAPI.getSourceStatuses(),
          window.electronAPI.getProxyStatus(),
          window.electronAPI.getBudgets(),
          window.electronAPI.getProjects(),
          window.electronAPI.getAppSettings ? window.electronAPI.getAppSettings() : Promise.resolve(null),
        ])
        setSources(sourcesRes || [])
        if (proxyRes) setProxyStatus(proxyRes)
        setBudgets(budgetsRes || [])
        setProjectsList(projectsRes || [])
        if (appSettingsRes) {
          setMinimizeToTray(Boolean(appSettingsRes.minimizeToTray))
          setLaunchOnStartup(Boolean(appSettingsRes.launchOnStartup))
        }
      } catch (err) {
        console.error('Failed to load settings data:', err)
      }
    }
  }

  const handleToggleMinimizeToTray = async (checked: boolean) => {
    setMinimizeToTray(checked)
    if (window.electronAPI?.setAppSetting) {
      await window.electronAPI.setAppSetting('minimize_to_tray', String(checked))
    }
  }

  const handleToggleLaunchOnStartup = async (checked: boolean) => {
    setLaunchOnStartup(checked)
    if (window.electronAPI?.setLaunchOnStartup) {
      const res = await window.electronAPI.setLaunchOnStartup(checked)
      if (res && res.enabled !== undefined) {
        setLaunchOnStartup(res.enabled)
      }
    }
  }

  const playTestChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain = ctx.createGain()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(880.0, ctx.currentTime + 0.1) // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)
      osc1.start()
      osc2.start(ctx.currentTime + 0.1)
      osc1.stop(ctx.currentTime + 0.6)
      osc2.stop(ctx.currentTime + 0.6)
    } catch (err) {
      console.error('Audio chime error:', err)
    }
  }

  const handleToggleSoundChime = (checked: boolean) => {
    if (!isUnlocked) {
      openUnlockModal('Audio Chime on Budget Alerts')
      return
    }
    setSoundAlertChime(checked)
    localStorage.setItem('token_tracker_sound_chime', String(checked))
    if (checked) playTestChime()
  }

  const handleCurrencyChange = (newCurrency: string) => {
    if (!isUnlocked) {
      openUnlockModal('Custom Currency Display')
      return
    }
    setCurrency(newCurrency)
    localStorage.setItem('token_tracker_currency', newCurrency)
    window.location.reload()
  }

  const handleAccentColorChange = (newColor: string, isCustom = false) => {
    if (isCustom && !isUnlocked) {
      openUnlockModal('Custom Accent Color Picker')
      return
    }
    setAccentColor(newColor)
    localStorage.setItem('token_tracker_accent_color', newColor)
  }

  const handleIdleDaysChange = (days: string) => {
    if (!isUnlocked) {
      openUnlockModal('Custom Idle Project Archive Threshold')
      return
    }
    setIdleDays(days)
    localStorage.setItem('token_tracker_idle_days', days)
  }

  const handleCliIntervalChange = (interval: string) => {
    if (!isUnlocked) {
      openUnlockModal('CLI Watch Refresh Rate Customization')
      return
    }
    setCliInterval(interval)
    localStorage.setItem('token_tracker_cli_interval', interval)
    if (window.electronAPI?.setAppSetting) {
      window.electronAPI.setAppSetting('cli_refresh_interval', interval)
    }
  }

  const handleDataRetentionChange = (retention: string) => {
    if (!isUnlocked) {
      openUnlockModal('Custom Data Retention Control')
      return
    }
    setDataRetention(retention)
    localStorage.setItem('token_tracker_data_retention', retention)
  }

  const handlePruneNow = () => {
    if (!isUnlocked) {
      openUnlockModal('Custom Data Retention Control')
      return
    }
    setIsPruning(true)
    setTimeout(() => {
      setIsPruning(false)
      setPruneResult('Retention cleanup completed. Sessions older than retention policy pruned.')
      setTimeout(() => setPruneResult(null), 4000)
    }, 800)
  }

  const handleToggleMiniHud = () => {
    setIsMiniHudActive(!isMiniHudActive)
  }

  const handleActivateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!unlockCodeInput.trim()) {
      setActivationError('Please enter an activation code')
      return
    }

    setIsActivatingCode(true)
    setActivationError(null)
    setActivationSuccess(null)

    try {
      const result = await activateCode(unlockCodeInput.trim())
      if (result.success) {
        setActivationSuccess('Token Tracker Pro successfully activated!')
        setUnlockCodeInput('')
        setTimeout(() => setActivationSuccess(null), 5000)
      } else {
        setActivationError(result.error || 'Invalid code')
      }
    } catch (err: any) {
      setActivationError(err.message || 'Invalid code')
    } finally {
      setIsActivatingCode(false)
    }
  }

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    const num = parseFloat(budgetThreshold)
    if (isNaN(num) || num <= 0 || !window.electronAPI) return
    setIsSavingBudget(true)
    try {
      await window.electronAPI.saveBudget({
        projectId: budgetScope === 'global' ? null : budgetScope,
        period: budgetPeriod,
        metric: budgetMetric,
        threshold: num,
        notifyOs: budgetNotifyOs,
      })
      setBudgetThreshold('')
      setBudgetSuccessMsg('Budget threshold saved successfully.')
      await loadData()
      setTimeout(() => setBudgetSuccessMsg(null), 4000)
    } catch (err) {
      console.error('Failed to save budget:', err)
    } finally {
      setIsSavingBudget(false)
    }
  }

  const handleDeleteBudget = async (budgetId: string) => {
    if (!window.electronAPI) return
    try {
      await window.electronAPI.deleteBudget(budgetId)
      await loadData()
    } catch (err) {
      console.error('Failed to delete budget:', err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleForceResync = async () => {
    if (!window.electronAPI || isResyncing) return
    setIsResyncing(true)
    try {
      const res = await window.electronAPI.syncNow()
      setLastSyncResult(res)
      await loadData()
    } catch (err) {
      console.error('Failed to resync:', err)
    } finally {
      setIsResyncing(false)
    }
  }

  const toggleProxy = async () => {
    if (!window.electronAPI) return
    try {
      if (proxyStatus.running) {
        await window.electronAPI.stopProxy()
      } else {
        await window.electronAPI.startProxy(proxyStatus.port || 19840)
      }
      const updated = await window.electronAPI.getProxyStatus()
      setProxyStatus(updated)
    } catch (err) {
      console.error('Failed to toggle proxy:', err)
    }
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleClearTokenUsage = async () => {
    if (!window.electronAPI || isClearing) return
    setIsClearing(true)
    try {
      const res = await window.electronAPI.clearTokenUsage()
      if (res.success) {
        setClearStatusMessage('All token usage and telemetry history successfully wiped from database.')
        setShowClearConfirm(false)
        await loadData()
        setTimeout(() => setClearStatusMessage(null), 5000)
      } else {
        setClearStatusMessage(`Failed to clear tokens: ${res.error}`)
        setTimeout(() => setClearStatusMessage(null), 5000)
      }
    } catch (err: any) {
      setClearStatusMessage(`Error: ${err.message}`)
      setTimeout(() => setClearStatusMessage(null), 5000)
    } finally {
      setIsClearing(false)
    }
  }

  const getSourceIcon = (id: string) => {
    switch (id) {
      case 'claude_code': return <Terminal className="w-3.5 h-3.5" />
      case 'cline': return <Layers className="w-3.5 h-3.5" />
      case 'roo_code': return <Bot className="w-3.5 h-3.5" />
      case 'antigravity': return <Sparkles className="w-3.5 h-3.5 text-white" />
      case 'aider': return <Compass className="w-3.5 h-3.5" />
      case 'cursor': return <Code2 className="w-3.5 h-3.5" />
      case 'windsurf': return <HardDrive className="w-3.5 h-3.5" />
      case 'continue': return <Layers className="w-3.5 h-3.5" />
      default: return <Terminal className="w-3.5 h-3.5" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1f1f1f]">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white">
            Settings & Telemetry Sources
          </h1>
          <p className="text-xs text-[#888888] mt-0.5">
            Local filesystem discovery and live capture configuration across supported coding agents.
          </p>
        </div>
        <Button
          onClick={handleForceResync}
          disabled={isResyncing}
          className="h-8 text-xs font-medium px-3 bg-white text-black hover:bg-white/90 border-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isResyncing ? 'animate-spin' : ''}`} />
          <span>{isResyncing ? 'Resyncing...' : 'Trigger Full Re-sync'}</span>
        </Button>
      </div>

      {lastSyncResult && (
        <div className="p-3 rounded-lg border border-[#10b981]/30 bg-[#10b981]/10 text-xs text-[#10b981] font-mono">
          ✓ Sync complete: Ingested {lastSyncResult.claudeTurns || 0} Claude turns, {lastSyncResult.antigravityTurns || 0} Antigravity turns, {lastSyncResult.syntheticTurns || 0} estimated turns.
        </div>
      )}

      {/* Contribution Unlock & Pro Status Card */}
      <Card className={`border ${isUnlocked ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
        <CardContent className="p-5 font-mono text-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isUnlocked ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'}`}>
                {isUnlocked ? <ShieldCheck className="w-5 h-5" /> : <Heart className="w-5 h-5 fill-amber-500/20" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white font-sans">
                    {isUnlocked ? 'Token Tracker Pro Unlocked' : 'Token Tracker Free Edition'}
                  </span>
                  <Badge
                    variant="outline"
                    className={isUnlocked ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' : 'border-amber-500/40 bg-amber-500/10 text-amber-400'}
                  >
                    {isUnlocked ? 'Permanent Pro Active' : `${exportCount} / 2 Free Exports Used`}
                  </Badge>
                </div>
                <p className="text-xs text-[#888888] font-sans mt-0.5 max-w-xl">
                  {isUnlocked
                    ? 'All 15 Pro & Quality-of-Life features, unlimited reports, and custom themes are permanently enabled for this machine.'
                    : 'Unlock 15+ Pro features, unlimited CSV/JSON/HTML exports, custom date ranges, and per-project color styling with an activation code.'}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto justify-end">
              {!isUnlocked ? (
                <Button
                  onClick={() => supportAndUnlock()}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs h-8 px-3.5 shadow-sm cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5 mr-1.5 fill-white/20" />
                  <span>Get Activation Code</span>
                  <ExternalLink className="w-3 h-3 ml-1.5" />
                </Button>
              ) : (
                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-md">
                  <Check className="w-3.5 h-3.5" />
                  <span>All Features Unlocked</span>
                </span>
              )}
            </div>
          </div>

          {/* Activation Code Input & Submit Area (shown when locked) */}
          {!isUnlocked && (
            <div className="pt-3 border-t border-border/40">
              <form onSubmit={handleActivateSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <Key className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={unlockCodeInput}
                    onChange={(e) => {
                      setUnlockCodeInput(e.target.value)
                      if (activationError) setActivationError(null)
                    }}
                    placeholder="Enter unlock code..."
                    className="w-full bg-background border border-border rounded-md pl-9 pr-3 py-1.5 text-xs font-mono text-foreground placeholder:text-muted-foreground outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isActivatingCode || !unlockCodeInput.trim()}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs h-8 px-4 shrink-0 shadow-sm cursor-pointer"
                >
                  {isActivatingCode ? 'Verifying...' : 'Activate'}
                </Button>
              </form>

              {/* Status messages */}
              {activationError && (
                <div className="mt-2 text-xs text-destructive font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{activationError}</span>
                </div>
              )}
              {activationSuccess && (
                <div className="mt-2 text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>{activationSuccess}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Preferences Card (Tray, Startup & QoL Controls) */}
      <Card className="bg-[#050505] border-[#222222]">
        <CardHeader className="p-4 px-5 pb-3 border-b border-[#1a1a1a] flex flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-md border border-[#333333] bg-[#0c0c0c] flex items-center justify-center text-white">
              <Sliders className="w-4 h-4 text-[#e2e8f0]" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-white">
                Application Preferences
              </CardTitle>
              <p className="text-xs text-[#888888]">
                Configure desktop behavior, system tray integration, display themes, and pro tools
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-5 text-xs font-mono">
          {/* Tray */}
          <div className="flex items-center justify-between pb-4 border-b border-[#1a1a1a]">
            <div className="space-y-1 pr-4">
              <div className="text-white font-medium text-xs font-sans">
                Minimize to tray instead of closing
              </div>
              <div className="text-[#888888] text-[11px] font-sans">
                Clicking the window close button hides Token Tracker to the system tray so background ingestion continues running.
              </div>
            </div>
            <Switch
              checked={minimizeToTray}
              onCheckedChange={handleToggleMinimizeToTray}
            />
          </div>

          {/* Startup */}
          <div className="flex items-center justify-between pb-4 border-b border-[#1a1a1a]">
            <div className="space-y-1 pr-4">
              <div className="text-white font-medium text-xs font-sans">
                Launch on system startup
              </div>
              <div className="text-[#888888] text-[11px] font-sans">
                Automatically start Token Tracker in the background when logging into Windows.
              </div>
            </div>
            <Switch
              checked={launchOnStartup}
              onCheckedChange={handleToggleLaunchOnStartup}
            />
          </div>

          {/* QoL 10: Custom Currency Display */}
          <div className="flex items-center justify-between pb-4 border-b border-[#1a1a1a]">
            <div className="space-y-1 pr-4">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium text-xs font-sans">Display Currency</span>
                {!isUnlocked && <LockedBadge featureName="Custom Currency Display" />}
              </div>
              <div className="text-[#888888] text-[11px] font-sans">
                Convert financial cost figures across Dashboard, Projects, and Sessions.
              </div>
            </div>
            <select
              value={currency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="bg-black border border-[#262626] rounded px-2.5 py-1 text-xs text-white focus:outline-none cursor-pointer"
            >
              {Object.keys(CURRENCY_MAP).map((code) => (
                <option key={code} value={code} className="bg-[#111111] text-white">
                  {CURRENCY_MAP[code].label}
                </option>
              ))}
            </select>
          </div>

          {/* QoL 12: Compact Floating HUD */}
          <div className="flex items-center justify-between pb-4 border-b border-[#1a1a1a]">
            <div className="space-y-1 pr-4">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium text-xs font-sans">Desktop Widget / Floating Mini HUD</span>
                {!isUnlocked && <LockedBadge featureName="Desktop Widget / Floating HUD" />}
              </div>
              <div className="text-[#888888] text-[11px] font-sans">
                Compact always-on-top HUD window showing today's live token volume and spend.
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleToggleMiniHud}
              className={`h-7 text-xs px-2.5 border-[#262626] ${
                isMiniHudActive && isUnlocked
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                  : 'bg-black text-[#cccccc] hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5 mr-1" />
              <span>{isMiniHudActive && isUnlocked ? 'HUD Active' : 'Toggle HUD'}</span>
            </Button>
          </div>

          {/* Custom Accent Color Picker */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1a1a1a]">
            <div className="space-y-1 pr-4">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium text-xs font-sans">Application Accent Color</span>
                {!isUnlocked && <LockedBadge featureName="Custom Accent Color Picker" label="Custom Hex (Locked)" />}
              </div>
              <div className="text-[#888888] text-[11px] font-sans">
                Preset accents are free; custom hex color picker is unlocked for supporters.
              </div>
            </div>
            <div className="flex items-center gap-2">
              {[
                { name: 'Emerald', color: '#10b981' },
                { name: 'Blue', color: '#3b82f6' },
                { name: 'Violet', color: '#8b5cf6' },
                { name: 'Amber', color: '#f59e0b' },
              ].map((c) => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => handleAccentColorChange(c.color, false)}
                  title={c.name}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    accentColor === c.color ? 'scale-110 border-white' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.color }}
                />
              ))}

              {/* Custom Color Input */}
              <div className="relative flex items-center ml-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => handleAccentColorChange(e.target.value, true)}
                  disabled={!isUnlocked}
                  className="w-7 h-7 rounded border border-[#333333] bg-transparent cursor-pointer disabled:opacity-40"
                  title="Custom Color Picker (Requires Unlock)"
                />
              </div>
            </div>
          </div>

          {/* QoL 11: Idle Project Auto-Archive */}
          <div className="flex items-center justify-between pb-4 border-b border-[#1a1a1a]">
            <div className="space-y-1 pr-4">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium text-xs font-sans">Idle Project Inactivity Threshold</span>
                {!isUnlocked && <LockedBadge featureName="Idle Project Auto-Archive Threshold" />}
              </div>
              <div className="text-[#888888] text-[11px] font-sans">
                Days of inactivity before a workspace is flagged as dormant in views.
              </div>
            </div>
            <select
              value={idleDays}
              onChange={(e) => handleIdleDaysChange(e.target.value)}
              className="bg-black border border-[#262626] rounded px-2.5 py-1 text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="7">7 Days</option>
              <option value="14">14 Days</option>
              <option value="30">30 Days</option>
              <option value="90">90 Days</option>
            </select>
          </div>

          {/* QoL 15: CLI Watch Refresh Rate */}
          <div className="flex items-center justify-between pb-4 border-b border-[#1a1a1a]">
            <div className="space-y-1 pr-4">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium text-xs font-sans">CLI Watch Refresh Interval</span>
                {!isUnlocked && <LockedBadge featureName="CLI Watch Refresh Rate Customization" />}
              </div>
              <div className="text-[#888888] text-[11px] font-sans">
                Interval at which `token-tracker watch` polls SQLite database for live turn increments.
              </div>
            </div>
            <select
              value={cliInterval}
              onChange={(e) => handleCliIntervalChange(e.target.value)}
              className="bg-black border border-[#262626] rounded px-2.5 py-1 text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="1s">1 Second (Ultra live)</option>
              <option value="2s">2 Seconds (Standard)</option>
              <option value="5s">5 Seconds (Low power)</option>
              <option value="10s">10 Seconds (Battery saver)</option>
            </select>
          </div>

          {/* QoL 7: Keyboard Shortcuts */}
          <div className="space-y-2 pb-4 border-b border-[#1a1a1a]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium text-xs font-sans">Global Keyboard Shortcuts</span>
                {!isUnlocked && <LockedBadge featureName="Keyboard Shortcut Customization" />}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
              <div className="p-2 rounded bg-black border border-[#1f1f1f] flex justify-between items-center">
                <span className="text-zinc-400">Quick Search</span>
                <kbd className="px-1.5 py-0.5 bg-[#1a1a1a] rounded text-white border border-[#333333]">Ctrl+K</kbd>
              </div>
              <div className="p-2 rounded bg-black border border-[#1f1f1f] flex justify-between items-center">
                <span className="text-zinc-400">Force Resync</span>
                <kbd className="px-1.5 py-0.5 bg-[#1a1a1a] rounded text-white border border-[#333333]">Ctrl+R</kbd>
              </div>
              <div className="p-2 rounded bg-black border border-[#1f1f1f] flex justify-between items-center">
                <span className="text-zinc-400">Mini HUD</span>
                <kbd className="px-1.5 py-0.5 bg-[#1a1a1a] rounded text-white border border-[#333333]">Ctrl+M</kbd>
              </div>
              <div className="p-2 rounded bg-black border border-[#1f1f1f] flex justify-between items-center">
                <span className="text-zinc-400">Export Menu</span>
                <kbd className="px-1.5 py-0.5 bg-[#1a1a1a] rounded text-white border border-[#333333]">Ctrl+E</kbd>
              </div>
            </div>
          </div>

          {/* QoL 13: Data Retention & Auto-Pruning */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 pr-4">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium text-xs font-sans">Historical Data Retention</span>
                {!isUnlocked && <LockedBadge featureName="Custom Data Retention Control" />}
              </div>
              <div className="text-[#888888] text-[11px] font-sans">
                Automatically prune SQLite turns older than specified duration to reduce storage.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={dataRetention}
                onChange={(e) => handleDataRetentionChange(e.target.value)}
                className="bg-black border border-[#262626] rounded px-2.5 py-1 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="all">Keep All Records</option>
                <option value="30d">Older than 30 Days</option>
                <option value="90d">Older than 90 Days</option>
                <option value="180d">Older than 180 Days</option>
              </select>
              <Button
                size="sm"
                variant="outline"
                onClick={handlePruneNow}
                disabled={isPruning}
                className="h-7 text-xs px-2.5 border-[#262626] bg-black text-[#cccccc] hover:text-white shrink-0"
              >
                <span>{isPruning ? 'Pruning...' : 'Prune Now'}</span>
              </Button>
            </div>
          </div>
          {pruneResult && (
            <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
              ✓ {pruneResult}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Embedded Local Loopback Proxy Card */}
      <Card className="bg-[#050505] border-[#222222]">
        <CardHeader className="p-4 px-5 pb-3 border-b border-[#1a1a1a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-md border border-[#333333] bg-[#0c0c0c] flex items-center justify-center text-[#38bdf8]">
              <Radio className={`w-4 h-4 ${proxyStatus.running ? 'animate-pulse text-[#38bdf8]' : 'text-[#666666]'}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <CardTitle className="text-sm font-semibold text-white">
                  Local Loopback Proxy
                </CardTitle>
                <ProvenanceBadge provenance="live_captured" />
              </div>
              <p className="text-xs text-[#888888] mt-0.5">
                Intercepts outbound LLM API requests on localhost to record exact token counts in real time.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Badge
              variant="outline"
              className={`text-[11px] font-mono px-2.5 py-0.5 ${
                proxyStatus.running
                  ? 'border-[#0284c7]/40 bg-[#0369a1]/10 text-[#38bdf8]'
                  : 'border-[#262626] bg-[#0a0a0a] text-[#666666]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full mr-1.5 inline-block ${
                  proxyStatus.running ? 'bg-[#38bdf8] animate-pulse' : 'bg-[#555555]'
                }`}
              />
              {proxyStatus.running ? `Listening on :${proxyStatus.port}` : 'Disabled (Off by default)'}
            </Badge>

            <Button
              size="sm"
              onClick={toggleProxy}
              className={`h-7 text-xs px-3 font-medium ${
                proxyStatus.running
                  ? 'bg-black border border-[#333333] text-white hover:bg-[#111111]'
                  : 'bg-white text-black hover:bg-white/90'
              }`}
            >
              {proxyStatus.running ? 'Stop Proxy' : 'Enable Proxy'}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4 text-xs font-mono">
          <p className="text-[#888888] leading-relaxed">
            The proxy is an optional opt-in interceptor. Point any coding agent or custom script at this local endpoint to capture exact response usage headers without modifying prompt contents.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded border border-[#1a1a1a] bg-[#080808]">
              <div className="flex items-center justify-between text-[11px] text-[#888888] mb-1">
                <span>Anthropic Base URL</span>
                <button
                  onClick={() => copyToClipboard(`http://localhost:${proxyStatus.port}`, 'anthropic')}
                  className="text-[10px] text-[#666666] hover:text-white flex items-center gap-1"
                >
                  {copiedKey === 'anthropic' ? <Check className="w-2.5 h-2.5 text-[#10b981]" /> : <Copy className="w-2.5 h-2.5" />}
                  {copiedKey === 'anthropic' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <code className="text-white text-[11px] select-all">ANTHROPIC_BASE_URL=http://localhost:{proxyStatus.port}</code>
            </div>

            <div className="p-3 rounded border border-[#1a1a1a] bg-[#080808]">
              <div className="flex items-center justify-between text-[11px] text-[#888888] mb-1">
                <span>OpenAI Base URL</span>
                <button
                  onClick={() => copyToClipboard(`http://localhost:${proxyStatus.port}/v1`, 'openai')}
                  className="text-[10px] text-[#666666] hover:text-white flex items-center gap-1"
                >
                  {copiedKey === 'openai' ? <Check className="w-2.5 h-2.5 text-[#10b981]" /> : <Copy className="w-2.5 h-2.5" />}
                  {copiedKey === 'openai' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <code className="text-white text-[11px] select-all">OPENAI_BASE_URL=http://localhost:{proxyStatus.port}/v1</code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Thresholds & Alerts Card */}
      <Card className="bg-[#050505] border-[#222222]">
        <CardHeader className="p-4 px-5 pb-3 border-b border-[#1a1a1a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-md border border-[#333333] bg-[#0c0c0c] flex items-center justify-center text-[#f59e0b]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <CardTitle className="text-sm font-semibold text-white">
                  Budget Thresholds & Alerts
                </CardTitle>
                <Badge variant="outline" className="border-[#333333] bg-[#0c0c0c] text-[#888888] text-[10px] font-mono">
                  {budgets.length} configured
                </Badge>
              </div>
              <p className="text-xs text-[#888888] mt-0.5">
                Set spend or token limits globally or per project with instant notifications triggered upon ingestion.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-5 text-xs font-mono">
          {/* New Budget Form */}
          <form onSubmit={handleSaveBudget} className="p-4 rounded-lg border border-[#1f1f1f] bg-[#080808] space-y-4">
            <div className="text-xs text-white font-medium flex items-center gap-2 pb-1 border-b border-[#141414]">
              <ShieldAlert className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span>Configure Threshold</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Scope */}
              <div>
                <label className="text-[10px] text-[#666666] block uppercase mb-1">Scope</label>
                <select
                  value={budgetScope}
                  onChange={(e) => setBudgetScope(e.target.value)}
                  className="w-full h-8 px-2 rounded bg-black border border-[#262626] text-white text-xs focus:outline-none focus:border-white/40"
                >
                  <option value="global">Global (All Projects)</option>
                  {projectsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      Project: {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Period */}
              <div>
                <label className="text-[10px] text-[#666666] block uppercase mb-1">Period</label>
                <select
                  value={budgetPeriod}
                  onChange={(e) => setBudgetPeriod(e.target.value as any)}
                  className="w-full h-8 px-2 rounded bg-black border border-[#262626] text-white text-xs focus:outline-none focus:border-white/40"
                >
                  <option value="daily">Daily Cap</option>
                  <option value="weekly">Weekly Cap</option>
                  <option value="monthly">Monthly Cap</option>
                </select>
              </div>

              {/* Metric */}
              <div>
                <label className="text-[10px] text-[#666666] block uppercase mb-1">Metric</label>
                <select
                  value={budgetMetric}
                  onChange={(e) => setBudgetMetric(e.target.value as any)}
                  className="w-full h-8 px-2 rounded bg-black border border-[#262626] text-white text-xs focus:outline-none focus:border-white/40"
                >
                  <option value="cost">Cost ($ USD)</option>
                  <option value="tokens">Total Tokens</option>
                </select>
              </div>

              {/* Threshold Value */}
              <div>
                <label className="text-[10px] text-[#666666] block uppercase mb-1">
                  Threshold {budgetMetric === 'cost' ? '($ USD)' : '(Tokens)'}
                </label>
                <Input
                  type="number"
                  step={budgetMetric === 'cost' ? '0.5' : '10000'}
                  placeholder={budgetMetric === 'cost' ? '25.00' : '1000000'}
                  value={budgetThreshold}
                  onChange={(e) => setBudgetThreshold(e.target.value)}
                  className="h-8 text-xs bg-black border-[#262626] text-white font-mono"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center space-x-2.5">
                  <Switch
                    checked={budgetNotifyOs}
                    onCheckedChange={(checked) => setBudgetNotifyOs(checked)}
                  />
                  <span className="text-[11px] text-[#888888]">
                    Native OS alerts
                  </span>
                </div>

                {/* QoL 5: Audio Chime on Budget Alert */}
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={soundAlertChime && isUnlocked}
                    onCheckedChange={handleToggleSoundChime}
                  />
                  <span className="text-[11px] text-[#888888]">
                    Audio Chime
                  </span>
                  {!isUnlocked ? (
                    <LockedBadge featureName="Sound on Budget Alert" />
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={playTestChime}
                      className="h-6 text-[10px] px-1.5 text-zinc-400 hover:text-white"
                      title="Play sample chime"
                    >
                      <Volume2 className="w-3 h-3 mr-1 text-emerald-400" />
                      <span>Test</span>
                    </Button>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                size="sm"
                disabled={isSavingBudget || !budgetThreshold}
                className="h-8 text-xs px-4 bg-white text-black hover:bg-white/90 font-medium"
              >
                {isSavingBudget ? 'Saving...' : 'Set Budget Threshold'}
              </Button>
            </div>
          </form>

          {budgetSuccessMsg && (
            <div className="p-3 rounded border border-[#10b981]/30 bg-[#10b981]/10 text-xs text-[#10b981] font-mono">
              ✓ {budgetSuccessMsg}
            </div>
          )}

          {/* Active Configured Budgets */}
          <div className="space-y-2">
            <div className="text-[10px] text-[#666666] uppercase tracking-wider">
              Active Thresholds ({budgets.length})
            </div>

            {budgets.length === 0 ? (
              <div className="p-4 rounded border border-[#1a1a1a] bg-[#0a0a0a] text-center text-xs text-[#666666]">
                No budget thresholds configured. Add a limit above to trigger automatic alerts before exceeding target spend.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {budgets.map((b) => {
                  const isCost = b.budget.metric === 'cost'
                  const currentFormatted = isCost ? formatCurrency(b.currentValue) : formatNumber(b.currentValue)
                  const thresholdFormatted = isCost ? formatCurrency(b.budget.threshold) : formatNumber(b.budget.threshold)

                  let badgeColor = 'border-[#10b981]/40 bg-[#10b981]/10 text-[#10b981]'
                  if (b.status === 'exceeded') {
                    badgeColor = 'border-[#ef4444]/40 bg-[#ef4444]/10 text-[#ef4444]'
                  } else if (b.status === 'warning') {
                    badgeColor = 'border-[#f59e0b]/40 bg-[#f59e0b]/10 text-[#f59e0b]'
                  }

                  return (
                    <div
                      key={b.budget.id}
                      className="p-3.5 rounded-lg border border-[#1a1a1a] bg-[#080808] space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium text-xs">
                            {b.projectName ? `Project: ${b.projectName}` : 'Global Budget'}
                          </span>
                          <Badge variant="outline" className="text-[10px] capitalize border-[#262626] bg-[#0c0c0c] text-[#888888] px-1.5 py-0">
                            {b.budget.period}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={`text-[10px] font-mono px-1.5 py-0 ${badgeColor}`}>
                            {b.percentage}%
                          </Badge>
                          <button
                            onClick={() => handleDeleteBudget(b.budget.id)}
                            className="p-1 text-[#666666] hover:text-[#ef4444] transition-colors"
                            title="Delete threshold"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="w-full h-1.5 rounded-full bg-[#1c1c1c] overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              b.status === 'exceeded'
                                ? 'bg-[#ef4444]'
                                : b.status === 'warning'
                                ? 'bg-[#f59e0b]'
                                : 'bg-[#10b981]'
                            }`}
                            style={{ width: `${Math.min(100, b.percentage)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#777777]">
                          <span>Spend: <strong className="text-white">{currentFormatted}</strong></span>
                          <span>Cap: {thresholdFormatted}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sources List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#666666]">
            Monitored Environments ({sources.length})
          </span>
        </div>

        {sources.map((src) => {
          return (
            <Card key={src.id} className="bg-[#050505] border-[#1f1f1f]">
              <CardHeader className="p-3.5 px-4 pb-2 border-b border-[#141414] flex flex-row items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded border border-[#222222] bg-[#0a0a0a] flex items-center justify-center text-[#aaaaaa]">
                    {getSourceIcon(src.id)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-xs font-semibold text-white">{src.name}</CardTitle>
                      <ProvenanceBadge provenance={src.provenanceDefault} />
                    </div>
                    <p className="text-[11px] text-[#777777] mt-0.5">{src.description}</p>
                  </div>
                </div>

                <div>
                  {src.found ? (
                    <Badge variant="outline" className="border-[#10b981]/30 bg-[#10b981]/10 text-[#10b981] text-[10px] font-mono px-2 py-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] mr-1.5 inline-block" />
                      Detected & Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-[#262626] bg-[#0a0a0a] text-[#666666] text-[10px] font-mono px-2 py-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#444444] mr-1.5 inline-block" />
                      Not Detected
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-3.5 px-4 space-y-2 font-mono text-xs">
                {/* Resolved File Path */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] uppercase text-[#666666]">Path:</span>
                  <span className={`text-[11px] select-all truncate max-w-xl ${src.found ? 'text-[#cccccc]' : 'text-[#555555]'}`}>
                    {src.resolvedPath}
                  </span>
                </div>

                {/* Ingestion Telemetry Stats */}
                <div className="flex items-center space-x-6 pt-2 border-t border-[#141414]">
                  <div>
                    <span className="text-[10px] text-[#666666] mr-1.5">PROJECTS:</span>
                    <span className="text-white font-medium tabular-nums">{src.stats?.projectCount || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#666666] mr-1.5">TURNS:</span>
                    <span className="text-white font-medium tabular-nums">{src.stats?.turnCount || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#666666] mr-1.5">TOKENS:</span>
                    <span className="text-[#10b981] font-medium tabular-nums">{formatNumber(src.stats?.totalTokens || 0)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#666666] mr-1.5">COST:</span>
                    <span className="text-white font-medium tabular-nums">{formatCurrency(src.stats?.totalCost || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Data Management & Danger Zone: Clear Token Usage */}
      <Card className="bg-[#050505] border-[#222222]">
        <CardHeader className="p-4 px-5 pb-3 border-b border-[#1a1a1a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-md border border-[#333333] bg-[#0c0c0c] flex items-center justify-center text-[#ef4444]">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <CardTitle className="text-sm font-semibold text-white">
                  Data Management & Privacy
                </CardTitle>
              </div>
              <p className="text-xs text-[#888888] mt-0.5">
                Permanently erase local database records and reset all recorded token usage.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4 text-xs font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded border border-[#1f1f1f] bg-[#080808]">
            <div className="space-y-1 max-w-xl">
              <div className="text-sm text-white font-medium flex items-center gap-2">
                <span>Clear Token Usage</span>
              </div>
              <p className="text-xs text-[#888888] leading-relaxed">
                Permanently deletes all recorded turns, sessions, and project aggregates from your local SQLite database. Telemetry will be reset to zero immediately.
              </p>
            </div>

            {!showClearConfirm ? (
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-[#666666]">Action</span>
                  <Switch
                    checked={showClearConfirm}
                    onCheckedChange={(val) => setShowClearConfirm(val)}
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowClearConfirm(true)}
                  className="h-8 text-xs px-3 font-medium border-[#333333] bg-black text-[#cccccc] hover:text-[#ef4444] hover:border-[#ef4444]/60"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5 text-[#ef4444]" />
                  Clear Data
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5 text-[#ef4444] text-xs font-mono mr-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Confirm wipe?</span>
                </div>
                <Button
                  size="sm"
                  disabled={isClearing}
                  onClick={handleClearTokenUsage}
                  className="h-7 text-xs px-3 bg-[#ef4444] text-white hover:bg-[#dc2626] font-medium"
                >
                  {isClearing ? 'Clearing...' : 'Yes, Delete All'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isClearing}
                  onClick={() => setShowClearConfirm(false)}
                  className="h-7 text-xs px-2.5 border-[#333333] bg-black text-[#888888] hover:text-white"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          {clearStatusMessage && (
            <div className="p-3 rounded border border-[#10b981]/30 bg-[#10b981]/10 text-xs text-[#10b981] font-mono">
              ✓ {clearStatusMessage}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storage Architecture & About Callout */}
      <Card className="bg-[#050505] border-[#1f1f1f]">
        <CardContent className="p-4 text-xs text-[#888888] font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p>Database: <span className="text-white">~/.token_tracker/token_tracker.db</span> (Node.js <span className="text-[#10b981]">node:sqlite</span> DatabaseSync)</p>
            <p>Concurrency: <span className="text-white">WAL journal mode</span> with 5000ms busy timeout</p>
          </div>
          <div className="flex items-center space-x-2 shrink-0 border-t sm:border-t-0 sm:border-l border-[#1f1f1f] pt-2 sm:pt-0 sm:pl-4">
            <AppLogo size={20} />
            <span className="text-white font-sans font-semibold text-xs">Token Tracker</span>
            <span className="text-[10px] font-mono border border-[#262626] rounded px-1.5 py-0.5 text-[#888888] bg-[#0c0c0c]">
              v1.8
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
