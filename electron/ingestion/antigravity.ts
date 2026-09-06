import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { DatabaseSync } from 'node:sqlite'
import { getDb } from '../db/database'
import { calculateTurnCost } from './pricing'

export interface AntigravityWorkspaceMap {
  [conversationId: string]: {
    workspacePath: string
    title?: string
  }
}

/**
 * Parses agyhub_summaries_proto.pb to map conversation UUIDs to local workspace directories.
 */
export function parseAgyhubSummaries(antigravityDir: string): AntigravityWorkspaceMap {
  const map: AntigravityWorkspaceMap = {}
  const pbPath = path.join(antigravityDir, 'agyhub_summaries_proto.pb')
  if (!fs.existsSync(pbPath)) {
    return map
  }

  try {
    const buf = fs.readFileSync(pbPath)
    const content = buf.toString('latin1')

    // Matches UUID followed within reasonable distance by file:/// URI
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi
    const fileUriRegex = /file:\/\/\/([a-zA-Z]:\/[^"\x00-\x1F\x7F]+|[^"\x00-\x1F\x7F]+)/gi

    // Chunk scan for proximate pairs
    const chunks = content.split('\n')
    let currentUuid: string | null = null

    for (const chunk of chunks) {
      const uuidMatch = chunk.match(uuidRegex)
      if (uuidMatch) {
        currentUuid = uuidMatch[0]
      }
      const uriMatch = chunk.match(fileUriRegex)
      if (uriMatch && currentUuid) {
        let rawUri = uriMatch[0].replace(/^file:\/\/\/?/i, '')
        let cleanPath = rawUri
        try {
          cleanPath = decodeURIComponent(rawUri)
        } catch {
          cleanPath = rawUri
        }
        // Normalize Windows drive slashes
        cleanPath = cleanPath.replace(/\//g, path.sep)
        map[currentUuid] = {
          workspacePath: cleanPath,
        }
      }
    }
  } catch (err) {
    console.warn('[Antigravity] Could not parse agyhub summaries:', err)
  }

  return map
}

interface ParsedTokenData {
  inputTokens: number
  outputTokens: number
  totalTokens: number
  modelName: string
}

/**
 * Recursively decodes protobuf wire format to extract exact token varints and model name.
 */
function extractTokensFromProtobuf(buf: Buffer): ParsedTokenData | null {
  // Extract model name string
  const str = buf.toString('latin1')
  const modelMatch = str.match(/gemini-[a-zA-Z0-9.-]+|claude-[a-zA-Z0-9.-]+/)
  const modelName = modelMatch ? modelMatch[0] : 'gemini-3.8-flash'

  function findTokenSubmessage(subBuf: Buffer): { inTok: number; outTok: number; totTok: number } | null {
    let pos = 0
    while (pos < subBuf.length) {
      const key = subBuf[pos++]
      const wireType = key & 0x7
      const fieldNum = key >> 3

      if (wireType === 0) {
        // Varint
        while (pos < subBuf.length && subBuf[pos++] & 0x80) {}
      } else if (wireType === 2) {
        // Length-delimited
        let len = 0
        let shift = 0
        while (pos < subBuf.length) {
          const b = subBuf[pos++]
          len |= (b & 0x7f) << shift
          if (!(b & 0x80)) break
          shift += 7
        }
        if (pos + len > subBuf.length) break
        const sub = subBuf.subarray(pos, pos + len)
        pos += len

        // Scan sub for fields 1, 2, 3, 5
        let subPos = 0
        let f1 = 0, f2 = 0, f3 = 0, f5 = 0
        let valid = true
        while (subPos < sub.length) {
          const sk = sub[subPos++]
          const sw = sk & 0x7
          const sn = sk >> 3
          if (sw === 0) {
            let v = 0, s = 0
            while (subPos < sub.length) {
              const b = sub[subPos++]
              v |= (b & 0x7f) << s
              if (!(b & 0x80)) break
              s += 7
            }
            if (sn === 1) f1 = v
            if (sn === 2) f2 = v
            if (sn === 3) f3 = v
            if (sn === 5) f5 = v
          } else if (sw === 2) {
            let l = 0, s = 0
            while (subPos < sub.length) {
              const b = sub[subPos++]
              l |= (b & 0x7f) << s
              if (!(b & 0x80)) break
              s += 7
            }
            subPos += l
          } else if (sw === 1) subPos += 8
          else if (sw === 5) subPos += 4
          else { valid = false; break }
        }

        if (valid && f1 > 0 && f2 > 0 && f3 > 0) {
          return { inTok: f2, outTok: f3, totTok: f5 || (f2 + f3) }
        }

        const nested = findTokenSubmessage(sub)
        if (nested) return nested
      } else if (wireType === 1) pos += 8
      else if (wireType === 5) pos += 4
      else break
    }
    return null
  }

  const tokenData = findTokenSubmessage(buf)
  if (!tokenData) return null

  return {
    inputTokens: tokenData.inTok,
    outputTokens: tokenData.outTok,
    totalTokens: tokenData.totTok,
    modelName,
  }
}

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
    VALUES (?, ?, ?, 'antigravity', ?)
  `)
  insertStmt.run(id, normalizedPath, projectName, Date.now())
  return id
}

/**
 * Ingests a single Antigravity conversation SQLite database.
 */
export function ingestAntigravityConversationDb(
  dbFilePath: string,
  workspaceMap: AntigravityWorkspaceMap
): { turnsIngested: number } {
  if (!fs.existsSync(dbFilePath)) return { turnsIngested: 0 }

  const db = getDb()
  const fileName = path.basename(dbFilePath)
  const conversationId = fileName.replace(/\.db$/i, '')

  let convDb: DatabaseSync | null = null
  try {
    convDb = new DatabaseSync(dbFilePath, { readOnly: true })

    // Check if gen_metadata table exists
    const hasGen = convDb.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='gen_metadata'").get()
    if (!hasGen) return { turnsIngested: 0 }

    // Resolve workspace project
    const wsInfo = workspaceMap[conversationId]
    const projectPath = wsInfo?.workspacePath || path.join(os.homedir(), '.gemini', 'antigravity', 'workspace-default')
    const projectId = getOrCreateProject(projectPath)

    // Get or create session
    const selectSession = db.prepare('SELECT id FROM sessions WHERE external_id = ?')
    const existingSession = selectSession.get(conversationId) as { id: string } | undefined

    let sessionId = existingSession?.id
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      const insertSession = db.prepare(`
        INSERT INTO sessions (id, project_id, tool_source, model, start_time, external_id, provenance)
        VALUES (?, ?, 'antigravity', 'gemini-3.8-flash', ?, ?, 'exact')
      `)
      insertSession.run(sessionId, projectId, Date.now(), conversationId)
    }

    const rows = convDb.prepare('SELECT idx, data FROM gen_metadata ORDER BY idx ASC').all() as Array<{ idx: number; data: Buffer }>
    let turnsIngested = 0

    const checkTurnStmt = db.prepare('SELECT id FROM turns WHERE session_id = ? AND timestamp = ?')
    const insertTurnStmt = db.prepare(`
      INSERT INTO turns (id, session_id, input_tokens, output_tokens, cache_read_tokens, cache_creation_tokens, cost_usd, timestamp, provenance)
      VALUES (?, ?, ?, ?, 0, 0, ?, ?, 'exact')
    `)

    db.exec('BEGIN TRANSACTION')
    try {
      for (const row of rows) {
        const parsed = extractTokensFromProtobuf(Buffer.from(row.data))
        if (parsed && (parsed.inputTokens > 0 || parsed.outputTokens > 0)) {
          // Construct deterministic step timestamp based on db file mtime and step index
          const fileStat = fs.statSync(dbFilePath)
          const stepTimestamp = Math.floor(fileStat.mtimeMs) + row.idx

          const existing = checkTurnStmt.get(sessionId, stepTimestamp)
          if (!existing) {
            const cost = calculateTurnCost(parsed.modelName, parsed.inputTokens, parsed.outputTokens)
            const turnId = crypto.randomUUID()
            insertTurnStmt.run(turnId, sessionId, parsed.inputTokens, parsed.outputTokens, cost, stepTimestamp)
            turnsIngested++
          }
        }
      }
      db.exec('COMMIT')
    } catch (txErr) {
      db.exec('ROLLBACK')
      throw txErr
    }

    return { turnsIngested }
  } catch (err) {
    console.warn(`[Antigravity] Could not ingest ${fileName}:`, err)
    return { turnsIngested: 0 }
  } finally {
    if (convDb) {
      try { convDb.close() } catch {}
    }
  }
}

/**
 * Ingests all Antigravity conversation databases found in ~/.gemini/antigravity/conversations.
 */
export function ingestAllAntigravity(): { totalDatabases: number; totalTurns: number } {
  const antigravityDir = path.join(os.homedir(), '.gemini', 'antigravity')
  const convDir = path.join(antigravityDir, 'conversations')

  if (!fs.existsSync(convDir)) {
    return { totalDatabases: 0, totalTurns: 0 }
  }

  const workspaceMap = parseAgyhubSummaries(antigravityDir)
  const files = fs.readdirSync(convDir)
  let totalDatabases = 0
  let totalTurns = 0

  for (const f of files) {
    if (f.endsWith('.db')) {
      const fullPath = path.join(convDir, f)
      totalDatabases++
      const res = ingestAntigravityConversationDb(fullPath, workspaceMap)
      totalTurns += res.turnsIngested
    }
  }

  return { totalDatabases, totalTurns }
}
