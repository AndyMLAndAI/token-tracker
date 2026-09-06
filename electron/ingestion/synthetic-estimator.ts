import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { DatabaseSync } from 'node:sqlite'
import { getEncoding } from 'js-tiktoken'
import { getDb } from '../db/database'
import { calculateTurnCost } from './pricing'

// Cached BPE tokenizer instances
let cl100kEncoder: ReturnType<typeof getEncoding> | null = null

function getTokenizer() {
  if (!cl100kEncoder) {
    cl100kEncoder = getEncoding('cl100k_base')
  }
  return cl100kEncoder
}

export function countEstimatedTokens(text: string): number {
  if (!text || typeof text !== 'string') return 0
  try {
    const enc = getTokenizer()
    return enc.encode(text).length
  } catch {
    // Fallback: ~4 chars per token rule of thumb
    return Math.ceil(text.length / 4)
  }
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

/**
 * 1. Continue.dev Session Parser (~/.continue/sessions/*.json)
 */
export function ingestContinueSessions(): { sessionsIngested: number; turnsIngested: number } {
  const continueDir = path.join(os.homedir(), '.continue', 'sessions')
  if (!fs.existsSync(continueDir)) return { sessionsIngested: 0, turnsIngested: 0 }

  const db = getDb()
  let sessionsIngested = 0
  let turnsIngested = 0

  const files = fs.readdirSync(continueDir)
  for (const f of files) {
    if (!f.endsWith('.json')) continue
    const fullPath = path.join(continueDir, f)

    try {
      const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
      const sessionId = data.sessionId || f.replace(/\.json$/i, '')
      const projectPath = data.workspaceDirectory || path.join(os.homedir(), '.continue', 'workspace-default')
      const projectId = getOrCreateProject(projectPath, 'continue')

      // Session
      const selectSession = db.prepare('SELECT id FROM sessions WHERE external_id = ?')
      const existingSession = selectSession.get(sessionId) as { id: string } | undefined

      let sessionDbId = existingSession?.id
      if (!sessionDbId) {
        sessionDbId = crypto.randomUUID()
        const insertSession = db.prepare(`
          INSERT INTO sessions (id, project_id, tool_source, model, start_time, external_id, provenance)
          VALUES (?, ?, 'continue', ?, ?, ?, 'estimated')
        `)
        insertSession.run(sessionDbId, projectId, data.modelTitle || 'claude-3-5-sonnet', Date.now(), sessionId)
        sessionsIngested++
      }

      // History turns
      const history = data.history || []
      let pendingPrompt = ''
      let turnIdx = 0

      for (const item of history) {
        const msg = item.message
        if (!msg) continue

        if (msg.role === 'user') {
          pendingPrompt = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
        } else if (msg.role === 'assistant' && pendingPrompt) {
          turnIdx++
          const replyText = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
          const inTok = countEstimatedTokens(pendingPrompt)
          const outTok = countEstimatedTokens(replyText)
          const modelName = data.modelTitle || 'claude-3-5-sonnet'
          const cost = calculateTurnCost(modelName, inTok, outTok)

          const timestamp = Math.floor(fs.statSync(fullPath).mtimeMs) + turnIdx
          const checkTurn = db.prepare('SELECT id FROM turns WHERE session_id = ? AND timestamp = ?')
          if (!checkTurn.get(sessionDbId, timestamp)) {
            const turnId = crypto.randomUUID()
            const insertTurn = db.prepare(`
              INSERT INTO turns (id, session_id, input_tokens, output_tokens, cache_read_tokens, cache_creation_tokens, cost_usd, timestamp, provenance)
              VALUES (?, ?, ?, ?, 0, 0, ?, ?, 'estimated')
            `)
            insertTurn.run(turnId, sessionDbId, inTok, outTok, cost, timestamp)
            turnsIngested++
          }

          pendingPrompt = ''
        }
      }
    } catch {
      // ignore individual malformed session file
    }
  }

  return { sessionsIngested, turnsIngested }
}

/**
 * 2. Cursor SQLite Workspace Storage Parser
 */
export function ingestCursorSessions(): { databasesScanned: number; turnsIngested: number } {
  let appData = process.env.APPDATA || ''
  if (!appData && os.platform() === 'darwin') {
    appData = path.join(os.homedir(), 'Library', 'Application Support')
  } else if (!appData) {
    appData = path.join(os.homedir(), '.config')
  }

  const cursorWsDir = path.join(appData, 'Cursor', 'User', 'workspaceStorage')
  if (!fs.existsSync(cursorWsDir)) return { databasesScanned: 0, turnsIngested: 0 }

  const db = getDb()
  let databasesScanned = 0
  let turnsIngested = 0

  const wsDirs = fs.readdirSync(cursorWsDir)
  for (const ws of wsDirs) {
    const vscdbPath = path.join(cursorWsDir, ws, 'state.vscdb')
    if (!fs.existsSync(vscdbPath)) continue

    let wsDb: DatabaseSync | null = null
    try {
      wsDb = new DatabaseSync(vscdbPath, { readOnly: true })
      databasesScanned++

      // Read workspace path from workspace.json
      let projectPath = path.join(cursorWsDir, ws)
      const wsJsonPath = path.join(cursorWsDir, ws, 'workspace.json')
      if (fs.existsSync(wsJsonPath)) {
        try {
          const wsJson = JSON.parse(fs.readFileSync(wsJsonPath, 'utf8'))
          if (wsJson.folder) {
            projectPath = decodeURIComponent(wsJson.folder.replace(/^file:\/\/\/?/i, '')).replace(/\//g, path.sep)
          }
        } catch {}
      }

      const projectId = getOrCreateProject(projectPath, 'cursor')

      // Query ItemTable for composer or chat state
      const rows = wsDb.prepare(`
        SELECT [key], value FROM ItemTable 
        WHERE [key] LIKE '%composerData%' OR [key] LIKE '%aichat%' OR [key] LIKE '%cursorDiskKV%'
      `).all() as Array<{ key: string; value: string }>

      for (const row of rows) {
        if (!row.value) continue
        try {
          const raw = typeof row.value === 'string' ? row.value : Buffer.from(row.value).toString('utf8')
          const parsed = JSON.parse(raw)

          // If composerData has conversations / chats
          const conversations = parsed.allComposers || parsed.tabs || []
          for (const conv of conversations) {
            const externalId = conv.composerId || conv.tabId || `cursor-${ws.slice(0, 8)}`
            const selectSession = db.prepare('SELECT id FROM sessions WHERE external_id = ?')
            let sessionDbId = (selectSession.get(externalId) as any)?.id

            if (!sessionDbId) {
              sessionDbId = crypto.randomUUID()
              const insertSession = db.prepare(`
                INSERT INTO sessions (id, project_id, tool_source, model, start_time, external_id, provenance)
                VALUES (?, ?, 'cursor', ?, ?, ?, 'estimated')
              `)
              insertSession.run(sessionDbId, projectId, conv.model || 'claude-3-5-sonnet', Date.now(), externalId)
            }

            const bubbles = conv.conversation || conv.bubbles || []
            let turnIdx = 0
            for (let i = 0; i < bubbles.length; i += 2) {
              const userBubble = bubbles[i]
              const assistantBubble = bubbles[i + 1]
              if (userBubble && assistantBubble) {
                turnIdx++
                const userText = userBubble.text || ''
                const asstText = assistantBubble.text || ''
                const inTok = countEstimatedTokens(userText)
                const outTok = countEstimatedTokens(asstText)
                const cost = calculateTurnCost(conv.model || 'claude-3-5-sonnet', inTok, outTok)

                const timestamp = (conv.createdAt || Date.now()) + turnIdx
                const checkTurn = db.prepare('SELECT id FROM turns WHERE session_id = ? AND timestamp = ?')
                if (!checkTurn.get(sessionDbId, timestamp)) {
                  const turnId = crypto.randomUUID()
                  const insertTurn = db.prepare(`
                    INSERT INTO turns (id, session_id, input_tokens, output_tokens, cache_read_tokens, cache_creation_tokens, cost_usd, timestamp, provenance)
                    VALUES (?, ?, ?, ?, 0, 0, ?, ?, 'estimated')
                  `)
                  insertTurn.run(turnId, sessionDbId, inTok, outTok, cost, timestamp)
                  turnsIngested++
                }
              }
            }
          }
        } catch {
          // ignore non-JSON row
        }
      }
    } catch {
      // ignore locked or invalid SQLite file
    } finally {
      if (wsDb) {
        try { wsDb.close() } catch {}
      }
    }
  }

  return { databasesScanned, turnsIngested }
}

/**
 * 3. Windsurf Workspace Storage Parser
 */
export function ingestWindsurfSessions(): { databasesScanned: number; turnsIngested: number } {
  let appData = process.env.APPDATA || ''
  if (!appData && os.platform() === 'darwin') {
    appData = path.join(os.homedir(), 'Library', 'Application Support')
  } else if (!appData) {
    appData = path.join(os.homedir(), '.config')
  }

  const windsurfWsDir = path.join(appData, 'Windsurf', 'User', 'workspaceStorage')
  if (!fs.existsSync(windsurfWsDir)) return { databasesScanned: 0, turnsIngested: 0 }

  const db = getDb()
  let databasesScanned = 0
  let turnsIngested = 0

  const wsDirs = fs.readdirSync(windsurfWsDir)
  for (const ws of wsDirs) {
    const vscdbPath = path.join(windsurfWsDir, ws, 'state.vscdb')
    if (!fs.existsSync(vscdbPath)) continue

    let wsDb: DatabaseSync | null = null
    try {
      wsDb = new DatabaseSync(vscdbPath, { readOnly: true })
      databasesScanned++

      let projectPath = path.join(windsurfWsDir, ws)
      const wsJsonPath = path.join(windsurfWsDir, ws, 'workspace.json')
      if (fs.existsSync(wsJsonPath)) {
        try {
          const wsJson = JSON.parse(fs.readFileSync(wsJsonPath, 'utf8'))
          if (wsJson.folder) {
            projectPath = decodeURIComponent(wsJson.folder.replace(/^file:\/\/\/?/i, '')).replace(/\//g, path.sep)
          }
        } catch {}
      }

      const projectId = getOrCreateProject(projectPath, 'windsurf')

      const rows = wsDb.prepare(`
        SELECT [key], value FROM ItemTable 
        WHERE [key] LIKE '%cascade%' OR [key] LIKE '%codeium%' OR [key] LIKE '%chat%'
      `).all() as Array<{ key: string; value: string }>

      for (const row of rows) {
        if (!row.value) continue
        try {
          const raw = typeof row.value === 'string' ? row.value : Buffer.from(row.value).toString('utf8')
          const parsed = JSON.parse(raw)
          const steps = parsed.messages || parsed.steps || []
          if (steps.length > 1) {
            const externalId = `windsurf-${ws.slice(0, 8)}`
            const selectSession = db.prepare('SELECT id FROM sessions WHERE external_id = ?')
            let sessionDbId = (selectSession.get(externalId) as any)?.id

            if (!sessionDbId) {
              sessionDbId = crypto.randomUUID()
              const insertSession = db.prepare(`
                INSERT INTO sessions (id, project_id, tool_source, model, start_time, external_id, provenance)
                VALUES (?, ?, 'windsurf', 'claude-3-5-sonnet', ?, ?, 'estimated')
              `)
              insertSession.run(sessionDbId, projectId, Date.now(), externalId)
            }

            let turnIdx = 0
            for (let i = 0; i < steps.length; i += 2) {
              const u = steps[i]
              const a = steps[i + 1]
              if (u && a) {
                turnIdx++
                const inTok = countEstimatedTokens(u.content || u.text || '')
                const outTok = countEstimatedTokens(a.content || a.text || '')
                const cost = calculateTurnCost('claude-3-5-sonnet', inTok, outTok)
                const timestamp = Date.now() - (steps.length - turnIdx) * 60000

                const checkTurn = db.prepare('SELECT id FROM turns WHERE session_id = ? AND timestamp = ?')
                if (!checkTurn.get(sessionDbId, timestamp)) {
                  const turnId = crypto.randomUUID()
                  const insertTurn = db.prepare(`
                    INSERT INTO turns (id, session_id, input_tokens, output_tokens, cache_read_tokens, cache_creation_tokens, cost_usd, timestamp, provenance)
                    VALUES (?, ?, ?, ?, 0, 0, ?, ?, 'estimated')
                  `)
                  insertTurn.run(turnId, sessionDbId, inTok, outTok, cost, timestamp)
                  turnsIngested++
                }
              }
            }
          }
        } catch {}
      }
    } catch {
      // ignore
    } finally {
      if (wsDb) {
        try { wsDb.close() } catch {}
      }
    }
  }

  return { databasesScanned, turnsIngested }
}

/**
 * Ingests all synthetic estimator sources across detected editor stores.
 */
export function runSyntheticEstimatorScan(): { totalTurnsIngested: number } {
  const cRes = ingestContinueSessions()
  const curRes = ingestCursorSessions()
  const wRes = ingestWindsurfSessions()

  return {
    totalTurnsIngested: cRes.turnsIngested + curRes.turnsIngested + wRes.turnsIngested,
  }
}
