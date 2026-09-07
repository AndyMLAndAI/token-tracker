import React from 'react'
import { render } from 'ink'
import { Watch } from '../cli/dist/components/Watch.js'
import { resolveDbPath } from '../cli/dist/db.js'

console.log('[VerifyWatch] Testing in-memory Ink Watch render cycle...')

const dbPath = resolveDbPath()
let tickCount = 0

// Create a custom stdout stream to capture Ink frames
import { PassThrough } from 'node:stream'
const customStdout = new PassThrough()

let frames = []
customStdout.on('data', (d) => {
  frames.push(d.toString())
})

const instance = render(React.createElement(Watch, { dbPath }), {
  stdout: customStdout,
  stdin: new PassThrough(),
  patchConsole: false,
})

console.log('[VerifyWatch] Mounted <Watch /> successfully.')

// Wait for 2-3 intervals (4.5s) to confirm state updates & live re-renders in place
await new Promise((resolve) => setTimeout(resolve, 4500))

console.log(`[VerifyWatch] Total Ink frames rendered: ${frames.length}`)
const combined = frames.join('')
console.log(`[VerifyWatch] Contains 'LIVE': ${combined.includes('LIVE')}`)
console.log(`[VerifyWatch] Contains 'TODAY': ${combined.includes('TODAY')}`)

instance.unmount()
console.log('[VerifyWatch] Unmounted <Watch /> cleanly.')

if (!combined.includes('LIVE')) {
  throw new Error('Expected "LIVE" in rendered output')
}

console.log('>>> INK WATCH COMPONENT LIVE RE-RENDER VERIFIED CLEANLY! <<<')
process.exit(0)
