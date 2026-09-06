import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { getDb } from '../db/database'
import { calculateTurnCost } from './pricing'

export interface StatsCacheData {
  version?: number
  lastComputedDate?: string
  dailyActivity?: Array<{
    date: string
    messageCount: number
    sessionCount: number
    toolCallCount: number
  }>
  dailyModelTokens?: Array<{
    date: string
    tokensByModel: Record<string, number>
  }>
  modelUsage?: Record<string, {
    inputTokens: number
    outputTokens: number
    cacheReadInputTokens: number
    cacheCreationInputTokens: number
    webSearchRequests?: number
    costUSD: number
    contextWindow?: number
    maxOutputTokens?: number
  }>
  totalSessions?: number
  totalMessages?: number
}

// Ingest ~/.claude/stats-cache.json
export function ingestClaudeStatsCache(): StatsCacheData | null {
  const statsPath = path.join(os.homedir(), '.claude', 'stats-cache.json')
  if (!fs.existsSync(statsPath)) {
    return null
  }

  try {
    const raw = fs.readFileSync(statsPath, 'utf8')
    const data: StatsCacheData = JSON.parse(raw)
    return data
  } catch (err) {
    console.error('Error reading Claude stats-cache.json:', err)
    return null
  }
}

// Helper to get or insert project
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
    VALUES (?, ?, ?, ?, ?)
  `)
  insertStmt.run(id, normalizedPath, projectName, 'claude_code', Date.now())
  return id
}

// Helper to get or insert session
function getOrCreateSession(sessionId: string, projectId: string, model: string, startTime: number): string {
  const db = getDb()
  const selectStmt = db.prepare('SELECT id FROM sessions WHERE external_id = ?')
  const existing = selectStmt.get(sessionId) as { id: string } | undefined
  if (existing) {
    return existing.id
  }

  const id = crypto.randomUUID()
  const insertStmt = db.prepare(`
    INSERT INTO sessions (id, project_id, tool_source, model, start_time, external_id, provenance)
    VALUES (?, ?, ?, ?, ?, ?, 'exact')
  `)
  insertStmt.run(id, projectId, 'claude_code', model || 'claude-3-7-sonnet', startTime || Date.now(), sessionId)
  return id
}

// Incremental byte-offset tailer for a single JSONL file
export function ingestClaudeJsonlFile(filePath: string): { turnsAdded: number } {
  const db = getDb()
  if (!fs.existsSync(filePath)) {
    return { turnsAdded: 0 }
  }

  const stat = fs.statSync(filePath)
  const selectOffset = db.prepare('SELECT byte_offset FROM file_offsets WHERE file_path = ?')
  const offsetRow = selectOffset.get(filePath) as { byte_offset: number } | undefined
  let startOffset = offsetRow ? offsetRow.byte_offset : 0

  // Detect file rotation or truncation
  if (stat.size < startOffset) {
    startOffset = 0
  }
  if (stat.size === startOffset) {
    return { turnsAdded: 0 }
  }

  // Read only the new chunk from startOffset to stat.size
  const fd = fs.openSync(filePath, 'r')
  const bufferSize = stat.size - startOffset
  const buffer = Buffer.alloc(bufferSize)
  fs.readSync(fd, buffer, 0, bufferSize, startOffset)
  fs.closeSync(fd)

  const content = buffer.toString('utf8')
  const lines = content.split('\n')

  let turnsAdded = 0
  const seenMessageIds = new Set<string>()

  // Session ID is derived from the filename: <session-uuid>.jsonl
  const fileName = path.basename(filePath)
  const sessionExternalId = fileName.replace(/\.jsonl$/i, '')

  let currentProjectId: string | null = null
  let currentSessionDbId: string | null = null

  db.exec('BEGIN TRANSACTION')
  try {
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      try {
        const entry = JSON.parse(trimmed)
        const cwd = entry.cwd
        if (cwd && !currentProjectId) {
          currentProjectId = getOrCreateProject(cwd)
        }

        // Check for assistant messages with token usage
        const message = entry.message
        if (entry.type === 'assistant' || (message && message.role === 'assistant')) {
          const usage = message?.usage
          const messageId = message?.id || entry.uuid

          if (usage && messageId && !seenMessageIds.has(messageId)) {
            seenMessageIds.add(messageId)

            if (!currentProjectId) {
              // Fallback project name from directory
              const parentDir = path.basename(path.dirname(filePath))
              currentProjectId = getOrCreateProject(parentDir.replace(/--/g, '/').replace(/-/g, '/'))
            }

            const modelName = message.model || 'claude-3-7-sonnet'
            const timestamp = entry.timestamp ? new Date(entry.timestamp).getTime() : Date.now()

            if (!currentSessionDbId) {
              currentSessionDbId = getOrCreateSession(sessionExternalId, currentProjectId, modelName, timestamp)
            }

            const inputTokens = Number(usage.input_tokens) || 0
            const outputTokens = Number(usage.output_tokens) || 0
            const cacheReadTokens = Number(usage.cache_read_input_tokens) || 0
            const cacheCreationTokens = Number(usage.cache_creation_input_tokens) || 0
            // Client-side cost calculation keyed by model family
            const costUsd = calculateTurnCost(
              modelName,
              inputTokens,
              outputTokens,
              cacheReadTokens,
              cacheCreationTokens
            )

            const turnId = crypto.randomUUID()
            const insertTurn = db.prepare(`
              INSERT INTO turns (id, session_id, input_tokens, output_tokens, cache_read_tokens, cache_creation_tokens, cost_usd, timestamp, provenance)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'exact')
            `)
            insertTurn.run(turnId, currentSessionDbId, inputTokens, outputTokens, cacheReadTokens, cacheCreationTokens, costUsd, timestamp)
            turnsAdded++
          }
        }
      } catch {
        // Ignore incomplete / malformed JSON streaming lines
      }
    }

    // Update file_offsets
    const upsertOffset = db.prepare(`
      INSERT INTO file_offsets (file_path, byte_offset, last_modified)
      VALUES (?, ?, ?)
      ON CONFLICT(file_path) DO UPDATE SET
        byte_offset = excluded.byte_offset,
        last_modified = excluded.last_modified
    `)
    upsertOffset.run(filePath, stat.size, stat.mtimeMs)

    db.exec('COMMIT')
  } catch (txErr) {
    db.exec('ROLLBACK')
    console.warn('[ClaudeCode] Transaction rollback on:', filePath, txErr)
  }

  return { turnsAdded }
}

// Ingest all projects under ~/.claude/projects/
export function ingestAllClaudeProjects(): { totalFiles: number; totalTurns: number } {
  const projectsDir = path.join(os.homedir(), '.claude', 'projects')
  if (!fs.existsSync(projectsDir)) {
    return { totalFiles: 0, totalTurns: 0 }
  }

  let totalFiles = 0
  let totalTurns = 0

  const projectDirs = fs.readdirSync(projectsDir)
  for (const pDir of projectDirs) {
    const fullDirPath = path.join(projectsDir, pDir)
    if (!fs.statSync(fullDirPath).isDirectory()) continue

    const files = fs.readdirSync(fullDirPath)
    for (const f of files) {
      if (f.endsWith('.jsonl')) {
        const filePath = path.join(fullDirPath, f)
        totalFiles++
        const res = ingestClaudeJsonlFile(filePath)
        totalTurns += res.turnsAdded
      }
    }
  }

  return { totalFiles, totalTurns }
}
