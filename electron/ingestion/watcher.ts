import chokidar, { FSWatcher } from 'chokidar'
import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'
import { ingestClaudeJsonlFile, ingestAllClaudeProjects } from './claude-code'
import { backfillAllExtensionTasks, ingestExtensionTaskHistory, ingestUiMessagesFile } from './cline-roo'
import { ingestAllAntigravity, ingestAntigravityConversationDb, parseAgyhubSummaries } from './antigravity'
import { runSyntheticEstimatorScan, ingestContinueSessions } from './synthetic-estimator'
import { getPlatformCodeGlobalStoragePath } from './path-resolver'

export interface IngestionEngineOptions {
  onDataChanged?: () => void
}

export class IngestionEngine {
  private watcher: FSWatcher | null = null
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map()
  private notifyTimer: NodeJS.Timeout | null = null
  private onDataChangedCallback?: () => void

  constructor(options?: IngestionEngineOptions) {
    this.onDataChangedCallback = options?.onDataChanged
  }

  public async runInitialIngestion(): Promise<{
    claudeTurns: number
    clineTasks: number
    rooTasks: number
    antigravityTurns: number
    syntheticTurns: number
  }> {
    console.log('[Ingestion] Running initial sync across all detected sources...')

    // 1. Claude Code
    const claudeResult = ingestAllClaudeProjects()
    console.log(`[Ingestion] Claude Code: ${claudeResult.totalFiles} files, ${claudeResult.totalTurns} turns ingested.`)

    // 2. Cline (Full historical backfill)
    const clineResult = backfillAllExtensionTasks('cline')
    console.log(`[Ingestion] Cline: ${clineResult.tasksIngested} tasks, ${clineResult.turnsIngested} detailed turns backfilled.`)

    // 3. Roo Code (Full historical backfill)
    const rooResult = backfillAllExtensionTasks('roo_code')
    console.log(`[Ingestion] Roo Code: ${rooResult.tasksIngested} tasks backfilled.`)

    // 4. Google Antigravity Decoder
    const agyResult = ingestAllAntigravity()
    console.log(`[Ingestion] Google Antigravity: ${agyResult.totalDatabases} databases, ${agyResult.totalTurns} turns decoded.`)

    // 5. Synthetic Estimators (Cursor, Windsurf, Continue.dev)
    const synthResult = runSyntheticEstimatorScan()
    console.log(`[Ingestion] Synthetic Estimator: ${synthResult.totalTurnsIngested} estimated turns ingested.`)

    return {
      claudeTurns: claudeResult.totalTurns,
      clineTasks: clineResult.tasksIngested,
      rooTasks: rooResult.tasksIngested,
      antigravityTurns: agyResult.totalTurns,
      syntheticTurns: synthResult.totalTurnsIngested,
    }
  }

  public startWatching() {
    const watchPaths: string[] = []

    // 1. Claude Code projects
    const claudeProjects = path.join(os.homedir(), '.claude', 'projects')
    if (fs.existsSync(claudeProjects)) {
      watchPaths.push(claudeProjects)
    }

    // 2. Cline
    const clineBase = getPlatformCodeGlobalStoragePath('saoudrizwan.claude-dev')
    if (fs.existsSync(clineBase)) {
      watchPaths.push(clineBase)
    }

    // 3. Roo Code
    const rooBase = getPlatformCodeGlobalStoragePath('rooveterinaryinc.roo-cline')
    if (fs.existsSync(rooBase)) {
      watchPaths.push(rooBase)
    }

    // 4. Google Antigravity conversations
    const antigravityConv = path.join(os.homedir(), '.gemini', 'antigravity', 'conversations')
    if (fs.existsSync(antigravityConv)) {
      watchPaths.push(antigravityConv)
    }

    // 5. Continue.dev sessions
    const continueSessions = path.join(os.homedir(), '.continue', 'sessions')
    if (fs.existsSync(continueSessions)) {
      watchPaths.push(continueSessions)
    }

    if (watchPaths.length === 0) {
      console.log('[Ingestion] No source directories found to watch.')
      return
    }

    console.log('[Ingestion] Starting chokidar watcher on:', watchPaths)
    this.watcher = chokidar.watch(watchPaths, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true,
      depth: 4,
    })

    this.watcher.on('add', (filePath: string) => this.handleFileEvent(filePath))
    this.watcher.on('change', (filePath: string) => this.handleFileEvent(filePath))
  }

  private handleFileEvent(filePath: string) {
    const existingTimer = this.debounceTimers.get(filePath)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // 350ms sliding debounce window
    const timer = setTimeout(() => {
      this.debounceTimers.delete(filePath)
      this.processFileUpdate(filePath)
    }, 350)

    this.debounceTimers.set(filePath, timer)
  }

  private processFileUpdate(filePath: string) {
    let changed = false

    if (filePath.endsWith('.jsonl') && filePath.includes('.claude')) {
      const res = ingestClaudeJsonlFile(filePath)
      if (res.turnsAdded > 0) changed = true
    } else if (filePath.endsWith('taskHistory.json')) {
      if (filePath.includes('saoudrizwan.claude-dev')) {
        const res = ingestExtensionTaskHistory('cline')
        if (res.tasksIngested > 0) changed = true
      } else if (filePath.includes('rooveterinaryinc.roo-cline')) {
        const res = ingestExtensionTaskHistory('roo_code')
        if (res.tasksIngested > 0) changed = true
      }
    } else if (filePath.endsWith('ui_messages.json')) {
      const tool = filePath.includes('rooveterinaryinc.roo-cline') ? 'roo_code' : 'cline'
      const res = ingestUiMessagesFile(filePath, tool)
      if (res.turnsAdded > 0) changed = true
    } else if (filePath.endsWith('.db') && filePath.includes('antigravity')) {
      const antigravityDir = path.join(os.homedir(), '.gemini', 'antigravity')
      const wsMap = parseAgyhubSummaries(antigravityDir)
      const res = ingestAntigravityConversationDb(filePath, wsMap)
      if (res.turnsIngested > 0) changed = true
    } else if (filePath.endsWith('.json') && filePath.includes('.continue')) {
      const res = ingestContinueSessions()
      if (res.turnsIngested > 0) changed = true
    }

    if (changed && this.onDataChangedCallback) {
      if (this.notifyTimer) {
        clearTimeout(this.notifyTimer)
      }
      this.notifyTimer = setTimeout(() => {
        this.notifyTimer = null
        if (this.onDataChangedCallback) {
          this.onDataChangedCallback()
        }
      }, 400)
    }
  }

  public stop() {
    // Clear all pending debounce timers
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer)
    }
    this.debounceTimers.clear()

    if (this.notifyTimer) {
      clearTimeout(this.notifyTimer)
      this.notifyTimer = null
    }

    if (this.watcher) {
      this.watcher.close()
      this.watcher = null
    }
    console.log('[Ingestion] IngestionEngine file watchers torn down cleanly.')
  }
}
