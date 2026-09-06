import { DatabaseSync } from 'node:sqlite'
import path from 'node:path'
import os from 'node:os'

const dbPath = path.join(os.homedir(), '.token_tracker', 'token_tracker.db')
const db = new DatabaseSync(dbPath)

try {
  const sessionCols = db.prepare('PRAGMA table_info(sessions)').all()
  if (!sessionCols.some((c) => c.name === 'provenance')) {
    db.exec("ALTER TABLE sessions ADD COLUMN provenance TEXT NOT NULL DEFAULT 'exact';")
    console.log('Added provenance to sessions.')
  }

  const turnCols = db.prepare('PRAGMA table_info(turns)').all()
  if (!turnCols.some((c) => c.name === 'provenance')) {
    db.exec("ALTER TABLE turns ADD COLUMN provenance TEXT NOT NULL DEFAULT 'exact';")
    console.log('Added provenance to turns.')
  }

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_sessions_provenance ON sessions(provenance);
    CREATE INDEX IF NOT EXISTS idx_turns_provenance ON turns(provenance);
  `)
  console.log('Created provenance indexes successfully.')
} catch (e) {
  console.error('Migration error:', e)
}

const turns = db.prepare('SELECT count(*) as count, provenance FROM turns GROUP BY provenance').all()
console.log('Current turns breakdown:', turns)
