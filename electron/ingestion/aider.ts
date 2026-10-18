import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
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

function sourceRecordId(prefix: string, sessionId: string, index: number, value: string): string {
  const digest = crypto.createHash('sha256').update(value).digest('hex').slice(0, 16)
  return `${prefix}:${sessionId}:${index}:${digest}`
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
  const selectSession = db.prepare("SELECT id FROM sessions WHERE external_id = ? AND tool_source = 'aider' AND project_id = ?")
  const existingSession = selectSession.get(sessionId, projectId) as { id: string } | undefined

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
      const turnId = crypto.randomUUID()
      const insertTurn = db.prepare(`
        INSERT INTO turns (id, session_id, input_tokens, output_tokens, cache_read_tokens, cache_creation_tokens, cost_usd, timestamp, provenance, source_record_id)
        VALUES (?, ?, ?, ?, 0, 0, ?, ?, 'exact', ?)
        ON CONFLICT(source_record_id) DO NOTHING
      `)
      const result = insertTurn.run(turnId, sessionDbId, inputTokens, outputTokens, costUsd, timestamp,
        sourceRecordId('aider-history', sessionId, turnIndex, line)) as { changes: number }
      if (result.changes > 0) {
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
      const selectSession = db.prepare("SELECT id FROM sessions WHERE external_id = ? AND tool_source = 'aider' AND project_id = ?")
      const existingSession = selectSession.get(sessionId, projectId) as { id: string } | undefined

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

      const turnId = crypto.randomUUID()
      const sourceId = data.id || data.uuid || data.request_id || line
      const insertTurn = db.prepare(`
        INSERT INTO turns (id, session_id, input_tokens, output_tokens, cache_read_tokens, cache_creation_tokens, cost_usd, timestamp, provenance, source_record_id)
        VALUES (?, ?, ?, ?, 0, 0, ?, ?, 'exact', ?)
        ON CONFLICT(source_record_id) DO NOTHING
      `)
      const result = insertTurn.run(turnId, sessionDbId, inputTokens, outputTokens, costUsd, timestamp,
        sourceRecordId('aider-analytics', sessionId, 0, String(sourceId))) as { changes: number }
      if (result.changes > 0) {
        turnsIngested++
      }
    } catch {
      // ignore malformed line
    }
  }

  return { turnsIngested }
}

/** Ingest supported Aider records stored below ~/.aider without scanning user projects. */
export function ingestAllAiderData(): { totalFiles: number; totalTurns: number } {
  const aiderHome = path.join(os.homedir(), '.aider')
  if (!fs.existsSync(aiderHome)) return { totalFiles: 0, totalTurns: 0 }

  let totalFiles = 0
  let totalTurns = 0
  const stack = [aiderHome]
  while (stack.length > 0) {
    const dir = stack.pop()!
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        stack.push(fullPath)
      } else if (entry.isFile() && entry.name.endsWith('.jsonl')) {
        totalFiles++
        totalTurns += ingestAiderAnalyticsJsonl(fullPath).turnsIngested
      } else if (entry.isFile() && entry.name === '.aider.chat.history.md') {
        totalFiles++
        totalTurns += ingestAiderMarkdownHistory(fullPath).turnsIngested
      }
    }
  }
  return { totalFiles, totalTurns }
}
