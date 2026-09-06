import { DatabaseSync } from 'node:sqlite'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'

let dbInstance: DatabaseSync | null = null

export function getDatabasePath(): string {
  // Store database in standard local user data directory: ~/.token_tracker/token_tracker.db
  const appDir = path.join(os.homedir(), '.token_tracker')
  if (!fs.existsSync(appDir)) {
    fs.mkdirSync(appDir, { recursive: true })
  }
  return path.join(appDir, 'token_tracker.db')
}

export function initDatabase(customPath?: string): DatabaseSync {
  if (dbInstance) return dbInstance

  const dbPath = customPath || getDatabasePath()
  const db = new DatabaseSync(dbPath)

  // Use WAL mode for concurrent reading and fast transactions
  db.exec('PRAGMA journal_mode = WAL;')
  db.exec('PRAGMA busy_timeout = 5000;')
  db.exec('PRAGMA foreign_keys = ON;')

  // Create tables according to exact specification with provenance support
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      path TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      tool_source TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      tool_source TEXT NOT NULL,
      model TEXT,
      start_time INTEGER NOT NULL,
      external_id TEXT,
      provenance TEXT NOT NULL DEFAULT 'exact',
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS turns (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      input_tokens INTEGER NOT NULL,
      output_tokens INTEGER NOT NULL,
      cache_read_tokens INTEGER NOT NULL DEFAULT 0,
      cache_creation_tokens INTEGER NOT NULL DEFAULT 0,
      cost_usd REAL NOT NULL DEFAULT 0.0,
      timestamp INTEGER NOT NULL,
      provenance TEXT NOT NULL DEFAULT 'exact',
      FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS file_offsets (
      file_path TEXT PRIMARY KEY,
      byte_offset INTEGER NOT NULL DEFAULT 0,
      last_modified INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      period TEXT NOT NULL,
      metric TEXT NOT NULL,
      threshold REAL NOT NULL,
      notify_os INTEGER NOT NULL DEFAULT 1,
      enabled INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS budget_alerts (
      id TEXT PRIMARY KEY,
      budget_id TEXT NOT NULL,
      project_id TEXT,
      period TEXT NOT NULL,
      metric TEXT NOT NULL,
      threshold REAL NOT NULL,
      current_value REAL NOT NULL,
      triggered_at INTEGER NOT NULL,
      dismissed INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_project_id ON sessions(project_id);
    CREATE INDEX IF NOT EXISTS idx_turns_session_id ON turns(session_id);
    CREATE INDEX IF NOT EXISTS idx_turns_timestamp ON turns(timestamp);
    CREATE INDEX IF NOT EXISTS idx_budgets_project_id ON budgets(project_id);
    CREATE INDEX IF NOT EXISTS idx_budget_alerts_budget_id ON budget_alerts(budget_id);
  `)

  // Safe schema migrations for existing databases
  try {
    const sessionCols = db.prepare('PRAGMA table_info(sessions)').all() as Array<{ name: string }>
    if (!sessionCols.some((c) => c.name === 'provenance')) {
      db.exec("ALTER TABLE sessions ADD COLUMN provenance TEXT NOT NULL DEFAULT 'exact';")
    }

    const turnCols = db.prepare('PRAGMA table_info(turns)').all() as Array<{ name: string }>
    if (!turnCols.some((c) => c.name === 'provenance')) {
      db.exec("ALTER TABLE turns ADD COLUMN provenance TEXT NOT NULL DEFAULT 'exact';")
    }

    // Create provenance indexes only after columns are guaranteed to exist
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_sessions_provenance ON sessions(provenance);
      CREATE INDEX IF NOT EXISTS idx_turns_provenance ON turns(provenance);
    `)
  } catch (migErr) {
    console.warn('[Database] Migration notice:', migErr)
  }

  dbInstance = db
  return db
}

export function getDb(): DatabaseSync {
  if (!dbInstance) {
    return initDatabase()
  }
  return dbInstance
}
