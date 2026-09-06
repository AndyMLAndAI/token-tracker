import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { getDb } from '../db/database'
import { getPlatformCodeGlobalStoragePath } from './path-resolver'

export interface TaskHistoryItem {
  id: string
  ulid?: string
  ts: number
  task?: string
  tokensIn?: number
  tokensOut?: number
  cacheWrites?: number
  cacheReads?: number
  totalCost?: number
  cwdOnTaskInitialization?: string
  modelId?: string
}

function getOrCreateProject(projectPath: string, toolSource: string): string {
  const db = getDb()
  const normalizedPath = path.normalize(projectPath)
  const projectName = path.basename(normalizedPath) || normalizedPath

  const selectStmt = db.prepare('SELECT id FROM projects WHERE path = ?')
  const existing = selectStmt.get(normalizedPath) as { id: string } | undefined
  if (existing) {
    return existing.id
  }

  const id = crypto.randomUUID()
  const insertStmt = db.prepare(`
    INSERT INTO projects (id, path, name, tool_source, created_at)
    VALUES (?, ?, ?, ?, ?)
  `)
  insertStmt.run(id, normalizedPath, projectName, toolSource, Date.now())
  return id
}

export function ingestExtensionTaskHistory(toolSource: 'cline' | 'roo_code'): { tasksIngested: number } {
  const db = getDb()
  const subDir = toolSource === 'cline' ? 'saoudrizwan.claude-dev' : 'rooveterinaryinc.roo-cline'
  const basePath = getPlatformCodeGlobalStoragePath(subDir)
  const historyPath = path.join(basePath, 'state', 'taskHistory.json')

  if (!fs.existsSync(historyPath)) {
    return { tasksIngested: 0 }
  }

  let tasks: TaskHistoryItem[] = []
  try {
    const content = fs.readFileSync(historyPath, 'utf8')
    tasks = JSON.parse(content)
  } catch (err) {
    console.error(`Error reading ${toolSource} taskHistory.json:`, err)
    return { tasksIngested: 0 }
  }

  let tasksIngested = 0

  for (const task of tasks) {
    if (!task.id) continue

    const cwd = task.cwdOnTaskInitialization || path.join(basePath, 'workspace-default')
    const projectId = getOrCreateProject(cwd, toolSource)

    // Check if session already exists
    const selectSession = db.prepare('SELECT id FROM sessions WHERE external_id = ?')
    const existingSession = selectSession.get(task.id) as { id: string } | undefined

    let sessionId = existingSession?.id
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      const insertSession = db.prepare(`
        INSERT INTO sessions (id, project_id, tool_source, model, start_time, external_id, provenance)
        VALUES (?, ?, ?, ?, ?, ?, 'exact')
      `)
      insertSession.run(
        sessionId,
        projectId,
        toolSource,
        task.modelId || 'claude-3-7-sonnet',
        task.ts || Date.now(),
        task.id
      )
    }

    // Check if turn already exists for this task
    const selectTurn = db.prepare('SELECT id FROM turns WHERE session_id = ?')
    const existingTurn = selectTurn.get(sessionId)
    if (!existingTurn && ((task.tokensIn || 0) > 0 || (task.tokensOut || 0) > 0)) {
      const turnId = crypto.randomUUID()
      const insertTurn = db.prepare(`
        INSERT INTO turns (id, session_id, input_tokens, output_tokens, cache_read_tokens, cache_creation_tokens, cost_usd, timestamp, provenance)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'exact')
      `)
      insertTurn.run(
        turnId,
        sessionId,
        task.tokensIn || 0,
        task.tokensOut || 0,
        task.cacheReads || 0,
        task.cacheWrites || 0,
        task.totalCost || 0.0,
        task.ts || Date.now()
      )
      tasksIngested++
    }
  }

  return { tasksIngested }
}

// Ingest ui_messages.json for active live turn tracking
export function ingestUiMessagesFile(uiMessagesPath: string, toolSource: 'cline' | 'roo_code'): { turnsAdded: number } {
  const db = getDb()
  if (!fs.existsSync(uiMessagesPath)) {
    return { turnsAdded: 0 }
  }

  const taskId = path.basename(path.dirname(uiMessagesPath))
  const selectSession = db.prepare('SELECT id FROM sessions WHERE external_id = ?')
  const sessionRow = selectSession.get(taskId) as { id: string } | undefined
  if (!sessionRow) {
    // If task was not in taskHistory yet, ingest the task first
    ingestExtensionTaskHistory(toolSource)
  }

  const sessionNow = selectSession.get(taskId) as { id: string } | undefined
  if (!sessionNow) return { turnsAdded: 0 }

  let messages: any[] = []
  try {
    messages = JSON.parse(fs.readFileSync(uiMessagesPath, 'utf8'))
  } catch {
    return { turnsAdded: 0 }
  }

  let turnsAdded = 0
  db.exec('BEGIN TRANSACTION')
  try {
    for (const msg of messages) {
      if (msg.type === 'say' && msg.say === 'api_req_started' && msg.text) {
        try {
          const stats = JSON.parse(msg.text)
          if (stats.tokensIn !== undefined || stats.tokensOut !== undefined) {
            // Check if turn already recorded with this exact timestamp
            const checkTurn = db.prepare('SELECT id FROM turns WHERE session_id = ? AND timestamp = ?')
            const hasTurn = checkTurn.get(sessionNow.id, msg.ts)
            if (!hasTurn) {
              const turnId = crypto.randomUUID()
              const insertTurn = db.prepare(`
                INSERT INTO turns (id, session_id, input_tokens, output_tokens, cache_read_tokens, cache_creation_tokens, cost_usd, timestamp, provenance)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'exact')
              `)
              insertTurn.run(
                turnId,
                sessionNow.id,
                stats.tokensIn || 0,
                stats.tokensOut || 0,
                stats.cacheReads || 0,
                stats.cacheWrites || 0,
                stats.cost || 0.0,
                msg.ts || Date.now()
              )
              turnsAdded++
            }
          }
        } catch {
          // text was not JSON
        }
      }
    }
    db.exec('COMMIT')
  } catch (txErr) {
    db.exec('ROLLBACK')
    console.warn('[ClineRoo] Transaction rollback on ui_messages:', txErr)
  }

  return { turnsAdded }
}

// Comprehensive historical backfill pass: scans all tasks/*/ui_messages.json
export function backfillAllExtensionTasks(toolSource: 'cline' | 'roo_code'): { tasksIngested: number; turnsIngested: number } {
  const historyRes = ingestExtensionTaskHistory(toolSource)
  let turnsIngested = 0

  const subDir = toolSource === 'cline' ? 'saoudrizwan.claude-dev' : 'rooveterinaryinc.roo-cline'
  const basePath = getPlatformCodeGlobalStoragePath(subDir)
  const tasksDir = path.join(basePath, 'tasks')

  if (fs.existsSync(tasksDir)) {
    try {
      const entries = fs.readdirSync(tasksDir)
      for (const entry of entries) {
        const uiPath = path.join(tasksDir, entry, 'ui_messages.json')
        if (fs.existsSync(uiPath)) {
          const res = ingestUiMessagesFile(uiPath, toolSource)
          turnsIngested += res.turnsAdded
        }
      }
    } catch (err) {
      console.warn(`[Ingestion] Could not scan ${toolSource} tasks dir:`, err)
    }
  }

  return { tasksIngested: historyRes.tasksIngested, turnsIngested }
}
