import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const cliDir = path.resolve(rootDir, 'cli')

console.log('[TestInkWatch] Starting Ink Watch mode live in-place verification...')

const child = spawn('node', ['./bin/token-tracker.js', 'watch'], {
  cwd: cliDir,
  stdio: ['pipe', 'pipe', 'pipe'],
})

let fullOutput = ''
let chunksCount = 0

child.stdout.on('data', (d) => {
  chunksCount++
  fullOutput += d.toString()
})

child.stderr.on('data', (d) => {
  console.error('[STDERR]', d.toString())
})

// Let it run for 4.5 seconds to capture multiple in-place render ticks
await new Promise((resolve) => setTimeout(resolve, 4500))

// Send Ctrl+C via stdin or SIGINT
console.log('[TestInkWatch] Sending SIGINT to watch process...')
child.kill('SIGINT')

await new Promise((resolve) => {
  child.on('close', (code) => {
    console.log(`[TestInkWatch] Watch process exited cleanly with code: ${code}`)
    resolve(true)
  })
})

console.log(`[TestInkWatch] Total chunks received: ${chunksCount}`)
console.log(`[TestInkWatch] Contains LIVE marker: ${fullOutput.includes('LIVE')}`)
console.log(`[TestInkWatch] Contains ANSI cursor repositioning (in-place render): ${/\x1B\[\d+A/.test(fullOutput)}`)

if (!fullOutput.includes('LIVE')) {
  throw new Error('Watch mode did not render LIVE marker!')
}

if (!/\x1B\[\d+A/.test(fullOutput)) {
  throw new Error('Watch mode did not use ANSI cursor repositioning for in-place re-renders!')
}

console.log('>>> INK WATCH IN-PLACE LIVE RE-RENDER VERIFIED SUCCESSFULLY! <<<')
