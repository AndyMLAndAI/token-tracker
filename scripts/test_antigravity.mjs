import { DatabaseSync } from 'node:sqlite'
import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'

const dbPath = path.join(os.homedir(), '.token_tracker', 'token_tracker.db')
const db = new DatabaseSync(dbPath)

// Check antigravity conversations
const antigravityDir = path.join(os.homedir(), '.gemini', 'antigravity')
const convDir = path.join(antigravityDir, 'conversations')

console.log('Antigravity conversations dir exists:', fs.existsSync(convDir))
if (fs.existsSync(convDir)) {
  const files = fs.readdirSync(convDir).filter(f => f.endsWith('.db'))
  console.log(`Found ${files.length} Antigravity conversation databases.`)
}

const currentSessions = db.prepare('SELECT tool_source, count(*) as count FROM sessions GROUP BY tool_source').all()
console.log('Current sessions by tool source:', currentSessions)
const currentTurns = db.prepare('SELECT provenance, count(*) as count FROM turns GROUP BY provenance').all()
console.log('Current turns by provenance:', currentTurns)
