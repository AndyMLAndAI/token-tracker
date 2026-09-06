import { BrowserWindow, Notification } from 'electron'
import crypto from 'node:crypto'
import { getDb } from '../db/database'

export interface Budget {
  id: string
  projectId: string | null
  period: 'daily' | 'weekly' | 'monthly'
  metric: 'cost' | 'tokens'
  threshold: number
  notifyOs: boolean
  enabled: boolean
  createdAt: number
}

export interface BudgetStatus {
  budget: Budget
  projectName?: string
  currentValue: number
  percentage: number
  remaining: number
  status: 'normal' | 'warning' | 'exceeded'
}

export interface BudgetAlert {
  id: string
  budgetId: string
  projectId: string | null
  projectName?: string
  period: string
  metric: string
  threshold: number
  currentValue: number
  triggeredAt: number
  dismissed: boolean
}

export function getPeriodStartTime(period: 'daily' | 'weekly' | 'monthly'): number {
  const now = new Date()
  if (period === 'daily') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  } else if (period === 'weekly') {
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Monday as start of week
    return new Date(now.getFullYear(), now.getMonth(), diff).getTime()
  } else {
    return new Date(now.getFullYear(), now.getMonth(), 1).getTime()
  }
}

export function calculateBudgetUsage(budget: Budget): number {
  const db = getDb()
  const startTime = getPeriodStartTime(budget.period)

  if (budget.projectId) {
    const field = budget.metric === 'cost' ? 't.cost_usd' : '(t.input_tokens + t.output_tokens)'
    const stmt = db.prepare(`
      SELECT COALESCE(SUM(${field}), 0) as total
      FROM turns t
      JOIN sessions s ON t.session_id = s.id
      WHERE s.project_id = ? AND t.timestamp >= ?
    `)
    const row = stmt.get(budget.projectId, startTime) as any
    return Number(row?.total || 0)
  } else {
    const field = budget.metric === 'cost' ? 'cost_usd' : '(input_tokens + output_tokens)'
    const stmt = db.prepare(`
      SELECT COALESCE(SUM(${field}), 0) as total
      FROM turns
      WHERE timestamp >= ?
    `)
    const row = stmt.get(startTime) as any
    return Number(row?.total || 0)
  }
}

export function checkBudgetsAndNotify(mainWindow?: BrowserWindow | null): BudgetAlert[] {
  const db = getDb()
  const budgetsStmt = db.prepare('SELECT * FROM budgets WHERE enabled = 1')
  const rows = budgetsStmt.all() as any[]

  const newAlerts: BudgetAlert[] = []

  for (const r of rows) {
    const budget: Budget = {
      id: r.id,
      projectId: r.project_id || null,
      period: r.period,
      metric: r.metric,
      threshold: Number(r.threshold),
      notifyOs: Boolean(r.notify_os),
      enabled: Boolean(r.enabled),
      createdAt: Number(r.created_at),
    }

    const currentUsage = calculateBudgetUsage(budget)
    const periodStart = getPeriodStartTime(budget.period)

    // Check if threshold is crossed
    if (currentUsage >= budget.threshold) {
      // Check if alert already recorded for this period
      const checkAlertStmt = db.prepare(`
        SELECT id FROM budget_alerts
        WHERE budget_id = ? AND triggered_at >= ?
        LIMIT 1
      `)
      const existingAlert = checkAlertStmt.get(budget.id, periodStart)

      if (!existingAlert) {
        // Resolve project name if applicable
        let projectName: string | undefined
        if (budget.projectId) {
          const pStmt = db.prepare('SELECT name FROM projects WHERE id = ?')
          const pRow = pStmt.get(budget.projectId) as any
          projectName = pRow?.name
        }

        const alertId = crypto.randomUUID()
        const now = Date.now()

        const insertStmt = db.prepare(`
          INSERT INTO budget_alerts (id, budget_id, project_id, period, metric, threshold, current_value, triggered_at, dismissed)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
        `)
        insertStmt.run(
          alertId,
          budget.id,
          budget.projectId,
          budget.period,
          budget.metric,
          budget.threshold,
          currentUsage,
          now
        )

        const alert: BudgetAlert = {
          id: alertId,
          budgetId: budget.id,
          projectId: budget.projectId,
          projectName,
          period: budget.period,
          metric: budget.metric,
          threshold: budget.threshold,
          currentValue: currentUsage,
          triggeredAt: now,
          dismissed: false,
        }

        newAlerts.push(alert)

        // Send in-app notification to renderer
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('budget-alert', alert)
        }

        // Native OS Notification when minimized or in background
        if (budget.notifyOs && Notification.isSupported()) {
          const isBackgrounded = !mainWindow || !mainWindow.isFocused() || mainWindow.isMinimized()
          if (isBackgrounded) {
            const formattedCurrent = budget.metric === 'cost' ? `$${currentUsage.toFixed(2)}` : `${Math.round(currentUsage).toLocaleString()} tokens`
            const formattedThreshold = budget.metric === 'cost' ? `$${budget.threshold.toFixed(2)}` : `${Math.round(budget.threshold).toLocaleString()} tokens`
            const scope = projectName ? `Project "${projectName}"` : 'Global'

            try {
              new Notification({
                title: 'Token Tracker — Budget Threshold Exceeded',
                body: `${scope} ${budget.period} budget reached: ${formattedCurrent} of ${formattedThreshold}.`,
                silent: false,
              }).show()
            } catch (notifErr) {
              console.warn('[Budget] Native notification error:', notifErr)
            }
          }
        }
      }
    }
  }

  return newAlerts
}

export function getAllBudgetStatuses(): BudgetStatus[] {
  const db = getDb()
  const budgetsStmt = db.prepare('SELECT * FROM budgets WHERE enabled = 1 ORDER BY created_at ASC')
  const rows = budgetsStmt.all() as any[]

  return rows.map((r) => {
    const budget: Budget = {
      id: r.id,
      projectId: r.project_id || null,
      period: r.period,
      metric: r.metric,
      threshold: Number(r.threshold),
      notifyOs: Boolean(r.notify_os),
      enabled: Boolean(r.enabled),
      createdAt: Number(r.created_at),
    }

    let projectName: string | undefined
    if (budget.projectId) {
      const pStmt = db.prepare('SELECT name FROM projects WHERE id = ?')
      const pRow = pStmt.get(budget.projectId) as any
      projectName = pRow?.name
    }

    const currentValue = calculateBudgetUsage(budget)
    const percentage = budget.threshold > 0 ? Math.min(100, Math.round((currentValue / budget.threshold) * 100)) : 0
    const remaining = Math.max(0, budget.threshold - currentValue)

    let status: 'normal' | 'warning' | 'exceeded' = 'normal'
    if (currentValue >= budget.threshold) {
      status = 'exceeded'
    } else if (percentage >= 80) {
      status = 'warning'
    }

    return {
      budget,
      projectName,
      currentValue,
      percentage,
      remaining,
      status,
    }
  })
}
