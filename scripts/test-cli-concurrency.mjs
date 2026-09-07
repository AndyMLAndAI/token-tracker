import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'
import os from 'node:os'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const cliDir = path.resolve(rootDir, 'cli')
const dbPath = path.join(os.homedir(), '.token_tracker', 'token_tracker.db')

console.log('[TestConcurrency] Starting Desktop App + CLI Concurrency Test...')
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// 1. Launch Electron desktop app in background
console.log('[TestConcurrency] Step 1: Launching Electron desktop app...')
const electronProc = spawn('npx.cmd', ['electron', '.'], {
  cwd: rootDir,
  shell: true,
  stdio: ['pipe', 'pipe', 'pipe'],
})

electronProc.stdout.on('data', (d) => {
  const line = d.toString()
  if (line.includes('[Main]') || line.includes('[Ingestion]')) {
    console.log('[Electron Output]', line.trim())
  }
})

electronProc.stderr.on('data', (d) => {
  // console.warn('[Electron Stderr]', d.toString().trim())
})

// Wait for Electron to initialize SQLite & watchers
await sleep(3500)

// 2. Query CLI while desktop app is running
console.log('\n[TestConcurrency] Step 2: Running CLI while desktop app is actively running...')
const runCli = (args) => {
  return new Promise((resolve, reject) => {
    const child = spawn('node', ['./bin/token-tracker.js', ...args], {
      cwd: cliDir,
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    let out = ''
    let err = ''
    child.stdout.on('data', (d) => (out += d.toString()))
    child.stderr.on('data', (d) => (err += d.toString()))
    child.on('close', (code) => {
      if (code === 0) resolve(out)
      else reject(new Error(`Exit code ${code}: ${err || out}`))
    })
  })
}

const statusJson1 = JSON.parse(await runCli(['status', '--json']))
console.log(`[TestConcurrency] CLI read successful! Current total turns: ${statusJson1.today.turns}, tokens: ${statusJson1.today.tokens}`)

// 3. Simulate new turn written by desktop app
console.log('\n[TestConcurrency] Step 3: Writing turn into active DB while both are running...')
const writerDb = new DatabaseSync(dbPath)
const testTurnId = 'concurrency-test-' + Date.now()
const testProjId = 'concurrency-proj-' + Date.now()
const testSessionId = 'concurrency-session-' + Date.now()

writerDb.prepare('INSERT OR IGNORE INTO projects (id, path, name, tool_source, created_at) VALUES (?, ?, ?, ?, ?)').run(
  testProjId,
  'C:/concurrency-test-' + Date.now(),
  'ConcurrencyProject',
  'claude_code',
  Date.now()
)
writerDb.prepare('INSERT INTO sessions (id, project_id, tool_source, model, start_time, provenance) VALUES (?, ?, ?, ?, ?, ?)').run(
  testSessionId,
  testProjId,
  'claude_code',
  'claude-3-7-sonnet',
  Date.now(),
  'exact'
)
writerDb.prepare('INSERT INTO turns (id, session_id, input_tokens, output_tokens, cost_usd, timestamp, provenance) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
  testTurnId,
  testSessionId,
  50000,
  10000,
  0.75,
  Date.now(),
  'exact'
)
writerDb.close()
console.log('[TestConcurrency] Inserted 60,000 new tokens ($0.75).')

// 4. Query CLI again to confirm live update reflected without lock error
console.log('\n[TestConcurrency] Step 4: Running CLI again to verify updated metrics...')
const statusJson2 = JSON.parse(await runCli(['status', '--json']))
console.log(`[TestConcurrency] Updated total turns: ${statusJson2.today.turns}, tokens: ${statusJson2.today.tokens}`)
if (statusJson2.today.tokens < statusJson1.today.tokens + 60000) {
  throw new Error('Tokens did not increment properly!')
}
console.log('[TestConcurrency] Confirmed tokens incremented accurately!')

// 5. Test formatted table outputs while running
console.log('\n[TestConcurrency] Step 5: Testing formatted table output while desktop app runs...')
const statusText = await runCli(['status'])
console.log('[TestConcurrency] Status table output length:', statusText.length)

const projectsText = await runCli(['projects'])
console.log('[TestConcurrency] Projects table output length:', projectsText.length)

// 6. Kill Electron desktop app
console.log('\n[TestConcurrency] Step 6: Terminating Electron desktop app...')
electronProc.kill('SIGTERM')
await sleep(1000)

// 7. Verify CLI still works when desktop app is NOT running
console.log('\n[TestConcurrency] Step 7: Running CLI when desktop app is closed...')
const statusJson3 = JSON.parse(await runCli(['status', '--json']))
console.log(`[TestConcurrency] CLI offline read successful! Total tokens: ${statusJson3.today.tokens}`)

console.log('\n>>> ALL CONCURRENCY AND OFFLINE TESTS PASSED WITH 0 ERRORS! <<<')
process.exit(0)
