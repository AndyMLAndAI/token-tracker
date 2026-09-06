import { ipcMain, BrowserWindow } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'
import crypto from 'node:crypto'
import { getDb } from '../db/database'
import { resolveAllSources } from '../ingestion/path-resolver'
import { ingestClaudeStatsCache } from '../ingestion/claude-code'
import { IngestionEngine } from '../ingestion/watcher'
import { proxyServer } from '../proxy/proxy-server'
import { getAllBudgetStatuses, checkBudgetsAndNotify } from './budget-checker'

function sanitizePath(rawPath: string): string {
  if (!rawPath) return '~/'
  const home = os.homedir()
  let sanitized = rawPath
  if (sanitized.startsWith(home)) {
    sanitized = sanitized.replace(home, '~')
  }
  sanitized = sanitized.replace(/^[A-Za-z]:\\[Uu]sers\\[^\\]+/, '~')
  sanitized = sanitized.replace(/^[A-Za-z]:\\/, '~/')
  sanitized = sanitized.replace(/\\/g, '/')
  return sanitized
}

export function registerIpcHandlers(mainWindow: BrowserWindow, engine: IngestionEngine) {
  // 1. Dashboard metrics
  ipcMain.handle('getDashboardMetrics', async () => {
    const db = getDb()

    const now = Date.now()
    const oneDayAgo = now - 24 * 60 * 60 * 1000
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000

    // Today tokens
    const todayStmt = db.prepare(`
      SELECT 
        COALESCE(SUM(input_tokens + output_tokens), 0) as total_tokens,
        COALESCE(SUM(cost_usd), 0) as total_cost
      FROM turns
      WHERE timestamp >= ?
    `)
    const todayRow = todayStmt.get(oneDayAgo) as any

    // Week tokens
    const weekStmt = db.prepare(`
      SELECT 
        COALESCE(SUM(input_tokens + output_tokens), 0) as total_tokens,
        COALESCE(SUM(cost_usd), 0) as total_cost
      FROM turns
      WHERE timestamp >= ?
    `)
    const weekRow = weekStmt.get(oneWeekAgo) as any

    // Month tokens
    const monthStmt = db.prepare(`
      SELECT 
        COALESCE(SUM(input_tokens + output_tokens), 0) as total_tokens,
        COALESCE(SUM(cost_usd), 0) as total_cost
      FROM turns
      WHERE timestamp >= ?
    `)
    const monthRow = monthStmt.get(oneMonthAgo) as any

    // All time totals
    const allTimeStmt = db.prepare(`
      SELECT 
        COALESCE(SUM(input_tokens), 0) as input_tokens,
        COALESCE(SUM(output_tokens), 0) as output_tokens,
        COALESCE(SUM(cache_read_tokens), 0) as cache_read_tokens,
        COALESCE(SUM(cache_creation_tokens), 0) as cache_creation_tokens,
        COALESCE(SUM(cost_usd), 0) as total_cost,
        COUNT(id) as total_turns
      FROM turns
    `)
    const allTimeRow = allTimeStmt.get() as any

    // Provenance breakdown (Exact vs Estimated vs Live-captured)
    const provStmt = db.prepare(`
      SELECT 
        provenance,
        COALESCE(SUM(input_tokens + output_tokens), 0) as total_tokens,
        COALESCE(SUM(cost_usd), 0) as total_cost,
        COUNT(id) as turn_count
      FROM turns
      GROUP BY provenance
    `)
    const provRows = provStmt.all() as any[]
    const provenanceBreakdown = {
      exact: { tokens: 0, cost: 0, turns: 0 },
      estimated: { tokens: 0, cost: 0, turns: 0 },
      live_captured: { tokens: 0, cost: 0, turns: 0 },
    }
    for (const r of provRows) {
      const p = r.provenance as keyof typeof provenanceBreakdown
      if (provenanceBreakdown[p]) {
        provenanceBreakdown[p] = {
          tokens: Number(r.total_tokens),
          cost: Number(r.total_cost),
          turns: Number(r.turn_count),
        }
      }
    }

    // Project tokens for bar chart (filter out zero-token projects)
    const projectTokensStmt = db.prepare(`
      SELECT 
        p.id,
        p.name,
        p.tool_source,
        COALESCE(SUM(t.input_tokens + t.output_tokens), 0) as tokens,
        COALESCE(SUM(t.cost_usd), 0) as cost,
        COUNT(DISTINCT s.id) as sessions_count
      FROM projects p
      LEFT JOIN sessions s ON s.project_id = p.id
      LEFT JOIN turns t ON t.session_id = s.id
      GROUP BY p.id
      HAVING tokens > 0 AND sessions_count > 0
      ORDER BY tokens DESC
      LIMIT 8
    `)
    const projectTokens = projectTokensStmt.all() as any[]

    // Daily trends for area chart and sparklines
    const dailyStmt = db.prepare(`
      SELECT 
        strftime('%Y-%m-%d', timestamp / 1000, 'unixepoch') as day,
        COALESCE(SUM(input_tokens), 0) as input_tokens,
        COALESCE(SUM(output_tokens), 0) as output_tokens,
        COALESCE(SUM(cache_read_tokens), 0) as cache_read_tokens,
        COALESCE(SUM(cache_creation_tokens), 0) as cache_creation_tokens,
        COALESCE(SUM(cost_usd), 0) as cost,
        COALESCE(SUM(input_tokens + output_tokens), 0) as total_tokens
      FROM turns
      WHERE timestamp >= ?
      GROUP BY day
      ORDER BY day ASC
    `)
    const dailyRows = dailyStmt.all(oneMonthAgo) as any[]

    // Historical stats cache from Claude Code
    const statsCache = ingestClaudeStatsCache()

    return {
      tokensToday: Number(todayRow?.total_tokens || 0),
      costToday: Number(todayRow?.total_cost || 0),
      tokensWeek: Number(weekRow?.total_tokens || 0),
      costWeek: Number(weekRow?.total_cost || 0),
      tokensMonth: Number(monthRow?.total_tokens || 0),
      costMonth: Number(monthRow?.total_cost || 0),
      allTime: {
        inputTokens: Number(allTimeRow?.input_tokens || 0),
        outputTokens: Number(allTimeRow?.output_tokens || 0),
        cacheReadTokens: Number(allTimeRow?.cache_read_tokens || 0),
        cacheCreationTokens: Number(allTimeRow?.cache_creation_tokens || 0),
        totalCost: Number(allTimeRow?.total_cost || 0),
        totalTurns: Number(allTimeRow?.total_turns || 0),
      },
      provenanceBreakdown,
      projectTokens: projectTokens.map((p) => ({
        id: p.id,
        name: p.name,
        toolSource: p.tool_source,
        tokens: Number(p.tokens),
        cost: Number(p.cost),
        sessionsCount: Number(p.sessions_count),
      })),
      dailyTrends: dailyRows.map((r) => ({
        date: r.day,
        input: Number(r.input_tokens),
        output: Number(r.output_tokens),
        cacheRead: Number(r.cache_read_tokens),
        cacheCreation: Number(r.cache_creation_tokens),
        total: Number(r.total_tokens),
        cost: Number(r.cost),
      })),
      claudeStatsCache: statsCache,
    }
  })

  // 2. Projects list (filter out null/empty projects with 0 tokens or 0 sessions)
  ipcMain.handle('getProjects', async () => {
    const db = getDb()
    const stmt = db.prepare(`
      SELECT 
        p.id,
        p.path,
        p.name,
        p.tool_source,
        p.created_at,
        COUNT(DISTINCT s.id) as session_count,
        COALESCE(SUM(t.input_tokens + t.output_tokens), 0) as total_tokens,
        COALESCE(SUM(t.input_tokens), 0) as input_tokens,
        COALESCE(SUM(t.output_tokens), 0) as output_tokens,
        COALESCE(SUM(t.cache_read_tokens), 0) as cache_read_tokens,
        COALESCE(SUM(t.cost_usd), 0) as total_cost,
        COALESCE(MAX(t.timestamp), p.created_at) as last_activity,
        COALESCE(MAX(t.provenance), 'exact') as provenance
      FROM projects p
      LEFT JOIN sessions s ON s.project_id = p.id
      LEFT JOIN turns t ON t.session_id = s.id
      GROUP BY p.id
      HAVING total_tokens > 0 AND session_count > 0
      ORDER BY last_activity DESC
    `)
    const rows = stmt.all() as any[]
    return rows.map((r) => ({
      id: r.id,
      path: sanitizePath(r.path),
      name: r.name,
      toolSource: r.tool_source,
      createdAt: Number(r.created_at),
      sessionCount: Number(r.session_count),
      totalTokens: Number(r.total_tokens),
      inputTokens: Number(r.input_tokens),
      outputTokens: Number(r.output_tokens),
      cacheReadTokens: Number(r.cache_read_tokens),
      totalCost: Number(r.total_cost),
      lastActivity: Number(r.last_activity),
      provenance: r.provenance || 'exact',
    }))
  })

  // 3. Project sessions (filter out null/empty sessions with 0 turns or 0 tokens)
  ipcMain.handle('getProjectSessions', async (_event, projectId: string) => {
    const db = getDb()
    const stmt = db.prepare(`
      SELECT 
        s.id,
        s.project_id,
        s.tool_source,
        s.model,
        s.start_time,
        s.external_id,
        s.provenance,
        COUNT(t.id) as turn_count,
        COALESCE(SUM(t.input_tokens + t.output_tokens), 0) as total_tokens,
        COALESCE(SUM(t.input_tokens), 0) as input_tokens,
        COALESCE(SUM(t.output_tokens), 0) as output_tokens,
        COALESCE(SUM(t.cache_read_tokens), 0) as cache_read_tokens,
        COALESCE(SUM(t.cache_creation_tokens), 0) as cache_creation_tokens,
        COALESCE(SUM(t.cost_usd), 0) as total_cost,
        COALESCE(MAX(t.timestamp), s.start_time) as last_turn_time
      FROM sessions s
      LEFT JOIN turns t ON t.session_id = s.id
      WHERE s.project_id = ?
      GROUP BY s.id
      HAVING turn_count > 0 AND total_tokens > 0
      ORDER BY s.start_time DESC
    `)
    const rows = stmt.all(projectId) as any[]
    return rows.map((r) => ({
      id: r.id,
      projectId: r.project_id,
      toolSource: r.tool_source,
      model: r.model || 'Unknown',
      startTime: Number(r.start_time),
      externalId: r.external_id ? `session_${r.external_id.slice(0, 8)}` : `session_${r.id.slice(0, 8)}`,
      provenance: r.provenance || 'exact',
      turnCount: Number(r.turn_count),
      totalTokens: Number(r.total_tokens),
      inputTokens: Number(r.input_tokens),
      outputTokens: Number(r.output_tokens),
      cacheReadTokens: Number(r.cache_read_tokens),
      cacheCreationTokens: Number(r.cache_creation_tokens),
      totalCost: Number(r.total_cost),
      lastTurnTime: Number(r.last_turn_time),
    }))
  })

  // 4. Session turns
  ipcMain.handle('getSessionTurns', async (_event, sessionId: string) => {
    const db = getDb()
    const stmt = db.prepare(`
      SELECT 
        id,
        session_id,
        input_tokens,
        output_tokens,
        cache_read_tokens,
        cache_creation_tokens,
        cost_usd,
        timestamp,
        provenance
      FROM turns
      WHERE session_id = ? AND (input_tokens > 0 OR output_tokens > 0)
      ORDER BY timestamp ASC
    `)
    const rows = stmt.all(sessionId) as any[]
    return rows.map((r) => ({
      id: r.id,
      sessionId: r.session_id,
      inputTokens: Number(r.input_tokens),
      outputTokens: Number(r.output_tokens),
      cacheReadTokens: Number(r.cache_read_tokens),
      cacheCreationTokens: Number(r.cache_creation_tokens),
      costUsd: Number(r.cost_usd),
      timestamp: Number(r.timestamp),
      provenance: r.provenance || 'exact',
    }))
  })

  // 5. Source statuses (All 8 sources)
  ipcMain.handle('getSourceStatuses', async () => {
    const sources = resolveAllSources()
    const db = getDb()

    return sources.map((src) => {
      const countStmt = db.prepare(`
        SELECT 
          COUNT(DISTINCT p.id) as project_count,
          COUNT(DISTINCT s.id) as session_count,
          COALESCE(SUM(t.input_tokens + t.output_tokens), 0) as total_tokens,
          COALESCE(SUM(t.cost_usd), 0) as total_cost,
          COUNT(t.id) as turn_count
        FROM projects p
        JOIN sessions s ON s.project_id = p.id
        JOIN turns t ON t.session_id = s.id
        WHERE p.tool_source = ? AND (t.input_tokens + t.output_tokens) > 0
      `)
      const row = countStmt.get(src.id) as any

      return {
        ...src,
        resolvedPath: sanitizePath(src.resolvedPath),
        stats: {
          projectCount: Number(row?.project_count || 0),
          sessionCount: Number(row?.session_count || 0),
          totalTokens: Number(row?.total_tokens || 0),
          totalCost: Number(row?.total_cost || 0),
          turnCount: Number(row?.turn_count || 0),
        },
      }
    })
  })

  // 6. Embedded Local Loopback Proxy controls
  ipcMain.handle('getProxyStatus', async () => {
    return proxyServer.getStatus()
  })

  ipcMain.handle('startProxy', async (_event, port?: number) => {
    try {
      const assignedPort = await proxyServer.start(port || 19840)
      return { success: true, port: assignedPort }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('stopProxy', async () => {
    await proxyServer.stop()
    return { success: true }
  })

  // 7. Trigger Manual Re-sync
  ipcMain.handle('syncNow', async () => {
    const res = await engine.runInitialIngestion()
    checkBudgetsAndNotify(mainWindow)
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('data-updated')
    }
    return res
  })

  // 8. Capture Window Screenshot (strictly bounded to application window)
  ipcMain.handle('captureScreenshot', async (_event, screenName: string) => {
    try {
      const screenshotsDir = path.join(process.env.APP_ROOT || process.cwd(), 'screenshots')
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true })
      }
      const safeName = (screenName || 'screenshot').replace(/[^a-zA-Z0-9_-]/g, '_')
      const targetPath = path.join(screenshotsDir, `${safeName}.png`)
      if (!mainWindow || mainWindow.isDestroyed()) {
        throw new Error('Application window is not available')
      }
      const img = await mainWindow.webContents.capturePage()
      fs.writeFileSync(targetPath, img.toPNG())
      console.log(`[Capture] Window screenshot saved: ${targetPath}`)
      return { success: true, path: targetPath }
    } catch (err: any) {
      console.error('[Capture] Screenshot capture failed:', err)
      return { success: false, error: err.message }
    }
  })

  // 9. Clear All Token Usage & Historical Data
  ipcMain.handle('clearTokenUsage', async () => {
    try {
      const db = getDb()
      db.exec(`
        DELETE FROM turns;
        DELETE FROM sessions;
        DELETE FROM projects;
        DELETE FROM file_offsets;
        DELETE FROM budget_alerts;
        VACUUM;
      `)
      console.log('[Database] Cleared all recorded token usage, sessions, projects, and file offsets.')
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('data-updated')
      }
      return { success: true }
    } catch (err: any) {
      console.error('[Database] Error clearing token usage:', err)
      return { success: false, error: err.message }
    }
  })

  // 10. Budgets & Alerts Handlers
  ipcMain.handle('getBudgets', async () => {
    return getAllBudgetStatuses()
  })

  ipcMain.handle('getBudgetStatus', async () => {
    const statuses = getAllBudgetStatuses()
    if (statuses.length === 0) return null
    // Prefer global budget first, else first configured
    const globalBudget = statuses.find((s) => !s.budget.projectId)
    return globalBudget || statuses[0]
  })

  ipcMain.handle('saveBudget', async (_event, budgetData: {
    id?: string
    projectId?: string | null
    period: 'daily' | 'weekly' | 'monthly'
    metric: 'cost' | 'tokens'
    threshold: number
    notifyOs?: boolean
  }) => {
    try {
      const db = getDb()
      const id = budgetData.id || crypto.randomUUID()
      const now = Date.now()

      const stmt = db.prepare(`
        INSERT INTO budgets (id, project_id, period, metric, threshold, notify_os, enabled, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 1, ?)
        ON CONFLICT(id) DO UPDATE SET
          project_id = excluded.project_id,
          period = excluded.period,
          metric = excluded.metric,
          threshold = excluded.threshold,
          notify_os = excluded.notify_os
      `)
      stmt.run(
        id,
        budgetData.projectId || null,
        budgetData.period,
        budgetData.metric,
        Number(budgetData.threshold),
        budgetData.notifyOs !== false ? 1 : 0,
        now
      )

      checkBudgetsAndNotify(mainWindow)
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('data-updated')
      }
      return { success: true, id }
    } catch (err: any) {
      console.error('[Budget] Error saving budget:', err)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('deleteBudget', async (_event, budgetId: string) => {
    try {
      const db = getDb()
      db.prepare('DELETE FROM budgets WHERE id = ?').run(budgetId)
      db.prepare('DELETE FROM budget_alerts WHERE budget_id = ?').run(budgetId)
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('data-updated')
      }
      return { success: true }
    } catch (err: any) {
      console.error('[Budget] Error deleting budget:', err)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('getActiveBudgetAlerts', async () => {
    const db = getDb()
    const stmt = db.prepare(`
      SELECT a.*, p.name as project_name
      FROM budget_alerts a
      LEFT JOIN projects p ON a.project_id = p.id
      WHERE a.dismissed = 0
      ORDER BY a.triggered_at DESC
      LIMIT 5
    `)
    const rows = stmt.all() as any[]
    return rows.map((r) => ({
      id: r.id,
      budgetId: r.budget_id,
      projectId: r.project_id,
      projectName: r.project_name,
      period: r.period,
      metric: r.metric,
      threshold: Number(r.threshold),
      currentValue: Number(r.current_value),
      triggeredAt: Number(r.triggered_at),
      dismissed: Boolean(r.dismissed),
    }))
  })

  ipcMain.handle('dismissBudgetAlert', async (_event, alertId: string) => {
    const db = getDb()
    db.prepare('UPDATE budget_alerts SET dismissed = 1 WHERE id = ?').run(alertId)
    return { success: true }
  })

  // 11. Report Generator Data Query
  ipcMain.handle('getReportData', async (_event, filter?: { startDate?: number; endDate?: number }) => {
    const db = getDb()
    const start = filter?.startDate || 0
    const end = filter?.endDate || Date.now()

    // Totals
    const totalStmt = db.prepare(`
      SELECT 
        COALESCE(SUM(input_tokens), 0) as input_tokens,
        COALESCE(SUM(output_tokens), 0) as output_tokens,
        COALESCE(SUM(cache_read_tokens), 0) as cache_read_tokens,
        COALESCE(SUM(cache_creation_tokens), 0) as cache_creation_tokens,
        COALESCE(SUM(cost_usd), 0) as total_cost,
        COUNT(id) as total_turns
      FROM turns
      WHERE timestamp >= ? AND timestamp <= ?
    `)
    const totalRow = totalStmt.get(start, end) as any

    // Breakdown by project
    const projStmt = db.prepare(`
      SELECT 
        p.id,
        p.name,
        p.tool_source,
        COALESCE(SUM(t.input_tokens + t.output_tokens), 0) as total_tokens,
        COALESCE(SUM(t.cost_usd), 0) as total_cost,
        COUNT(DISTINCT s.id) as sessions_count,
        COUNT(t.id) as turn_count
      FROM projects p
      JOIN sessions s ON s.project_id = p.id
      JOIN turns t ON t.session_id = s.id
      WHERE t.timestamp >= ? AND t.timestamp <= ?
      GROUP BY p.id
      HAVING total_tokens > 0
      ORDER BY total_tokens DESC
    `)
    const projectBreakdown = projStmt.all(start, end) as any[]

    // Breakdown by tool
    const toolStmt = db.prepare(`
      SELECT 
        p.tool_source,
        COALESCE(SUM(t.input_tokens + t.output_tokens), 0) as total_tokens,
        COALESCE(SUM(t.cost_usd), 0) as total_cost,
        COUNT(t.id) as turn_count
      FROM projects p
      JOIN sessions s ON s.project_id = p.id
      JOIN turns t ON t.session_id = s.id
      WHERE t.timestamp >= ? AND t.timestamp <= ?
      GROUP BY p.tool_source
      ORDER BY total_tokens DESC
    `)
    const toolBreakdown = toolStmt.all(start, end) as any[]

    // Breakdown by model
    const modelStmt = db.prepare(`
      SELECT 
        s.model,
        COALESCE(SUM(t.input_tokens + t.output_tokens), 0) as total_tokens,
        COALESCE(SUM(t.cost_usd), 0) as total_cost,
        COUNT(t.id) as turn_count
      FROM sessions s
      JOIN turns t ON t.session_id = s.id
      WHERE t.timestamp >= ? AND t.timestamp <= ?
      GROUP BY s.model
      ORDER BY total_tokens DESC
    `)
    const modelBreakdown = modelStmt.all(start, end) as any[]

    return {
      startDate: start,
      endDate: end,
      totals: {
        inputTokens: Number(totalRow?.input_tokens || 0),
        outputTokens: Number(totalRow?.output_tokens || 0),
        cacheReadTokens: Number(totalRow?.cache_read_tokens || 0),
        cacheCreationTokens: Number(totalRow?.cache_creation_tokens || 0),
        totalTokens: Number(totalRow?.input_tokens || 0) + Number(totalRow?.output_tokens || 0),
        totalCost: Number(totalRow?.total_cost || 0),
        totalTurns: Number(totalRow?.total_turns || 0),
      },
      projectBreakdown: projectBreakdown.map((p) => ({
        id: p.id,
        name: p.name,
        toolSource: p.tool_source,
        totalTokens: Number(p.total_tokens),
        totalCost: Number(p.total_cost),
        sessionsCount: Number(p.sessions_count),
        turnCount: Number(p.turn_count),
      })),
      toolBreakdown: toolBreakdown.map((t) => ({
        toolSource: t.tool_source,
        totalTokens: Number(t.total_tokens),
        totalCost: Number(t.total_cost),
        turnCount: Number(t.turn_count),
      })),
      modelBreakdown: modelBreakdown.map((m) => ({
        model: m.model || 'Unknown',
        totalTokens: Number(m.total_tokens),
        totalCost: Number(m.total_cost),
        turnCount: Number(m.turn_count),
      })),
    }
  })

  // 11. Frameless Window Controls
  ipcMain.handle('window-minimize', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.minimize()
    }
    return true
  })

  ipcMain.handle('window-maximize', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize()
      } else {
        mainWindow.maximize()
      }
    }
    return mainWindow ? mainWindow.isMaximized() : false
  })

  ipcMain.handle('window-close', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.close()
    }
    return true
  })

  ipcMain.handle('window-is-maximized', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      return mainWindow.isMaximized()
    }
    return false
  })
}
