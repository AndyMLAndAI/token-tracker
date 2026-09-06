import fs from 'node:fs'
import path from 'node:path'

console.log('--- Step 1: Verifying Icon Assets ---')
const files = [
  { p: 'build/icon.ico', minSize: 1000 },
  { p: 'build/icon.png', minSize: 1000 },
  { p: 'build/icon.icns', minSize: 1000 },
  { p: 'public/icon.png', minSize: 1000 },
]

for (const { p, minSize } of files) {
  const full = path.resolve(p)
  if (!fs.existsSync(full)) {
    throw new Error(`File does not exist: ${p}`)
  }
  const stat = fs.statSync(full)
  if (stat.size < minSize) {
    throw new Error(`File ${p} is too small: ${stat.size} bytes`)
  }
  console.log(`[PASS] ${p} exists (${stat.size} bytes)`)
}

// Verify ICO header (00 00 01 00)
const icoBuf = fs.readFileSync(path.resolve('build/icon.ico'))
if (icoBuf.readUInt16LE(0) !== 0 || icoBuf.readUInt16LE(2) !== 1) {
  throw new Error('Invalid ICO header')
}
console.log(`[PASS] build/icon.ico has valid ICO header with ${icoBuf.readUInt16LE(4)} image sizes`)

// Verify ICNS header ('icns')
const icnsBuf = fs.readFileSync(path.resolve('build/icon.icns'))
if (icnsBuf.toString('ascii', 0, 4) !== 'icns') {
  throw new Error('Invalid ICNS header')
}
console.log(`[PASS] build/icon.icns has valid ICNS header with total length ${icnsBuf.readUInt32BE(4)} bytes`)

console.log('\n--- Step 2: Verifying Frameless Window and IPC in Built Output ---')
const mainJs = fs.readFileSync(path.resolve('dist-electron/main.js'), 'utf8')
if (!mainJs.includes('frame: false') && !mainJs.includes('frame:!1') && !mainJs.includes('frame: !1') && !mainJs.includes('frame:false')) {
  throw new Error('dist-electron/main.js does not contain frame: false configuration')
}
console.log('[PASS] dist-electron/main.js contains frame: false (frame: !1)')

if (!mainJs.includes('window-minimize') || !mainJs.includes('window-maximize') || !mainJs.includes('window-close')) {
  throw new Error('dist-electron/main.js missing window control IPC handlers')
}
console.log('[PASS] dist-electron/main.js contains window-minimize, window-maximize, window-close handlers')

const preloadJs = fs.readFileSync(path.resolve('dist-electron/preload.cjs'), 'utf8')
if (!preloadJs.includes('minimizeWindow') || !preloadJs.includes('maximizeWindow') || !preloadJs.includes('closeWindow')) {
  throw new Error('dist-electron/preload.cjs missing exposed window control methods')
}
console.log('[PASS] dist-electron/preload.cjs exposes minimizeWindow, maximizeWindow, closeWindow')

console.log('\nAll icon and window chrome integrity verifications PASSED!')
