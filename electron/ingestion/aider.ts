import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { getDb } from '../db/database'
import { calculateTurnCost } from './pricing'

function getOrCreateProject(projectPath: string): string {
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
    VALUES (?, ?, ?, 'aider', ?)
  `)
  insertStmt.run(id, normalizedPath, projectName, Date.now())
  return id
}

function parseTokenNumber(str: string): number {
  const clean = str.trim().toLowerCase()
  if (clean.endsWith('k')) {
    return Math.round(parseFloat(clean.slice(0, -1)) * 1000)
  }
  if (clean.endsWith('m')) {
    return Math.round(parseFloat(clean.slice(0, -1)) * 1_000_000)
  }
  return parseInt(clean, 10) || 0
}

/**
 * Ingests an Aider chat history markdown file (.aider.chat.history.md).
 */
export function ingestAiderMarkdownHistory(filePath: string): { turnsIngested: number } {
  if (!fs.existsSync(filePath)) return { turnsIngested: 0 }

  const db = getDb()
  const projectDir = path.dirname(filePath)
  const projectId = getOrCreateProject(projectDir)
  const sessionId = `aider-${path.basename(projectDir)}`

  // Ensure session exists
  const selectSession = db.prepare('SELECT id FROM sessions WHERE external_id = ?')
  const existingSession = selectSession.get(sessionId) as { id: string } | undefined

  let sessionDbId = existingSession?.id
  if (!sessionDbId) {
    sessionDbId = crypto.randomUUID()
    const insertSession = db.prepare(`
      INSERT INTO sessions (id, project_id, tool_source, model, start_time, external_id, provenance)
      VALUES (?, ?, 'aider', 'claude-3-5-sonnet', ?, ?, 'exact')
    `)
    insertSession.run(sessionDbId, projectId, Date.now(), sessionId)
  }

  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.split('\n')
  let turnsIngested = 0

  // Regex pattern for Aider token summary line:
  // e.g. "Tokens: 4.2k sent, 312 received. Cost: $0.02 message, $0.15 session."
  const tokenRegex = /Tokens:\s*([0-9.]+[km]?)\s*sent,\s*([0-9.]+[km]?)\s*received/i
  const costRegex = /Cost:\s*\$([0-9.]+)\s*message/i

  let turnIndex = 0
  for (const line of lines) {
    const tokenMatch = line.match(tokenRegex)
    if (tokenMatch) {
      turnIndex++
      const inputTokens = parseTokenNumber(tokenMatch[1])
      const outputTokens = parseTokenNumber(tokenMatch[2])

      const costMatch = line.match(costRegex)
      const costUsd = costMatch
        ? parseFloat(costMatch[1])
        : calculateTurnCost('claude-3-5-sonnet', inputTokens, outputTokens)

      const fileStat = fs.statSync(filePath)
      const timestamp = Math.floor(fileStat.mtimeMs) + turnIndex

      const checkTurn = db.prepare('SELECT id FROM turns WHERE session_id = ? AND timestamp = ?')
      const existing = checkTurn.get(sessionDbId, timestamp)

      if (!existing) {
        const turnId = crypto.randomUUID()
        const insertTurn = db.prepare(`
          INSERT INTO turns (id, session_id, input_tokens, output_tokens, cache_read_tokens, cache_creation_tokens, cost_usd, timestamp, provenance)
          VALUES (?, ?, ?, ?, 0, 0, ?, ?, 'exact')
        `)
        insertTurn.run(turnId, sessionDbId, inputTokens, outputTokens, costUsd, timestamp)
        turnsIngested++
      }
    }
  }

  return { turnsIngested }
}

/**
 * Ingests an Aider analytics JSONL file if present (--analytics-log output).
 */
export function ingestAiderAnalyticsJsonl(filePath: string): { turnsIngested: number } {
  if (!fs.existsSync(filePath)) return { turnsIngested: 0 }

  const db = getDb()
  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.split('\n')
  let turnsIngested = 0

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    try {
      const data = JSON.parse(trimmed)
      const projectPath = data.git_root || path.dirname(filePath)
      const projectId = getOrCreateProject(projectPath)
      const model = data.model || 'claude-3-5-sonnet'

      const sessionId = `aider-${path.basename(projectPath)}`
      const selectSession = db.prepare('SELECT id FROM sessions WHERE external_id = ?')
      const existingSession = selectSession.get(sessionId) as { id: string } | undefined

      let sessionDbId = existingSession?.id
      if (!sessionDbId) {
        sessionDbId = crypto.randomUUID()
        const insertSession = db.prepare(`
          INSERT INTO sessions (id, project_id, tool_source, model, start_time, external_id, provenance)
          VALUES (?, ?, 'aider', ?, ?, ?, 'exact')
        `)
        insertSession.run(sessionDbId, projectId, model, Date.now(), sessionId)
      }

      const inputTokens = Number(data.tokens_sent || data.input_tokens || 0)
      const outputTokens = Number(data.tokens_received || data.output_tokens || 0)
      const costUsd = Number(data.cost || calculateTurnCost(model, inputTokens, outputTokens))
      const timestamp = data.timestamp ? new Date(data.timestamp).getTime() : Date.now()

      const checkTurn = db.prepare('SELECT id FROM turns WHERE session_id = ? AND timestamp = ?')
      const existing = checkTurn.get(sessionDbId, timestamp)

      if (!existing) {
        const turnId = crypto.randomUUID()
        const insertTurn = db.prepare(`
          INSERT INTO turns (id, session_id, input_tokens, output_tokens, cache_read_tokens, cache_creation_tokens, cost_usd, timestamp, provenance)
          VALUES (?, ?, ?, ?, 0, 0, ?, ?, 'exact')
        `)
        insertTurn.run(turnId, sessionDbId, inputTokens, outputTokens, costUsd, timestamp)
        turnsIngested++
      }
    } catch {
      // ignore malformed line
    }
  }

  return { turnsIngested }
}
