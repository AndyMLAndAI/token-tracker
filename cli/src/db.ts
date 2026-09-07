import { DatabaseSync } from 'node:sqlite'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'

let cachedDb: DatabaseSync | null = null
let cachedDbPath: string | null = null

export function resolveDbPath(): string | null {
  if (cachedDbPath) return cachedDbPath

  const candidates = [
    process.env.TOKEN_TRACKER_DB,
    path.join(os.homedir(), '.token_tracker', 'token_tracker.db'),
    process.env.APPDATA ? path.join(process.env.APPDATA, 'TokenTracker', 'token_tracker.db') : null,
    process.env.APPDATA ? path.join(process.env.APPDATA, 'token_tracker', 'token_tracker.db') : null,
    path.join(os.homedir(), '.config', 'token_tracker', 'token_tracker.db'),
  ].filter(Boolean) as string[]

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      cachedDbPath = p
      return p
    }
  }

  return null
}

export function getReadOnlyDb(): DatabaseSync {
  if (cachedDb) return cachedDb

  const dbPath = resolveDbPath()
  if (!dbPath) {
    console.error(
      '\n✖ Error: No Token Tracker data found.\n' +
      '  Install and run the desktop app first: https://tokentracker.dev\n' +
      '  (Checked: ~/.token_tracker/token_tracker.db, %APPDATA%/TokenTracker/token_tracker.db)\n'
    )
    process.exit(1)
  }

  try {
    const db = new DatabaseSync(dbPath, { readOnly: true })
    try {
      db.exec('PRAGMA busy_timeout = 5000;')
      db.exec('PRAGMA query_only = ON;')
    } catch {
      // Ignored if pragma is unsupported in read-only mode
    }
    cachedDb = db
    return db
  } catch (err: any) {
    console.error(`\n✖ Error opening database at ${dbPath}:`, err.message)
    process.exit(1)
  }
}
