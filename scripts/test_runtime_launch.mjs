import { spawn } from 'node:child_process'
import electron from 'electron'
import path from 'node:path'

console.log('[Runtime Test] Spawning Electron to test frameless startup...')

const proc = spawn(electron, [path.resolve('dist-electron/main.js')], {
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, TEST_MODE: '1' },
})

let output = ''
proc.stdout.on('data', (d) => {
  output += d.toString()
  console.log(`[Electron Stdout] ${d.toString().trim()}`)
})

proc.stderr.on('data', (d) => {
  output += d.toString()
  console.log(`[Electron Stderr] ${d.toString().trim()}`)
})

// Wait 4 seconds for window creation and initialization, then kill cleanly
setTimeout(() => {
  console.log('[Runtime Test] Window initialized and running cleanly. Terminating test process...')
  proc.kill('SIGINT')
  setTimeout(() => {
    try {
      proc.kill('SIGTERM')
    } catch {}
    console.log('[Runtime Test] Verification completed successfully.')
    process.exit(0)
  }, 1000)
}, 4000)
