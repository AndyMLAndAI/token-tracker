import { DatabaseSync } from 'node:sqlite'
import path from 'node:path'
import os from 'node:os'

const dbPath = path.join(os.homedir(), '.token_tracker', 'token_tracker.db')
const db = new DatabaseSync(dbPath)

// Check if provenance column exists
const cols = db.prepare('PRAGMA table_info(turns)').all()
console.log('Columns in turns:', cols.map(c => c.name))

const sessCols = db.prepare('PRAGMA table_info(sessions)').all()
console.log('Columns in sessions:', sessCols.map(c => c.name))

const counts = db.prepare('SELECT count(*) as count FROM turns').get()
console.log('Total turns currently:', counts)

const tools = db.prepare('SELECT tool_source, count(*) as count FROM sessions GROUP BY tool_source').all()
console.log('Sessions by tool source:', tools)
