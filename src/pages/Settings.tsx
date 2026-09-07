import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProvenanceBadge } from '@/components/ui/provenance-badge'
import { formatNumber, formatCurrency } from '@/lib/utils'
import { RefreshCw, Terminal, Layers, HardDrive, Radio, Sparkles, Code2, Bot, Compass, Check, Copy, Trash2, AlertTriangle, Bell, ShieldAlert, DollarSign, Sliders } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { AppLogo } from '@/components/ui/AppLogo'

export function Settings() {
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

  // App preferences (Tray & Startup)
  const [minimizeToTray, setMinimizeToTray] = useState(true)
  const [launchOnStartup, setLaunchOnStartup] = useState(false)

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

      {/* Application Preferences Card (Tray & Startup) */}
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
                Configure desktop behavior, system tray integration, and startup options
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-5 text-xs font-mono">
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

          <div className="flex items-center justify-between">
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
              <div className="flex items-center space-x-2.5">
                <Switch
                  checked={budgetNotifyOs}
                  onCheckedChange={(checked) => setBudgetNotifyOs(checked)}
                />
                <span className="text-[11px] text-[#888888]">
                  Native OS alerts when backgrounded or minimized
                </span>
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
              v1.7
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
